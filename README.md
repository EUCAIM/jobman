# jobman
The Kubernetes job manager

## System

**jobman** consists of tqo applications: a server exposing a REST API and a client to simplify the work with the server.
Both are written in Typescript and use Node.

## Common

These sections apply to both the client and the server applications.

### Settings

**jobman** uses a json settings file. 
We included a template for it with the source code.
It is used by default by the application.

You can also pass a path to a __settings.json__ file on the command line using the **-s**/**--settings** argument.
Check the full description of comand line options in the [usage.md](usage.md) file.

### Job naming

When you submit a job, you can specify a name. 
If you don't, **jobman** will generate a UUID v4 and use it for generating the name. 

IMPORTANT: for both cases, the internal job name will be prefixed by your OIDC user name (i.e. the "preferred_username" field in OIDC). DO NOT USE this prefixed name in your commands when you need to pass the name of the job as a parameter. This is for your information only and sometimes **jobman** will use this name internally.

### Ephemeral storage

Jobman launches jobs on the Kubernetes platform.
A job can have multiple pods, although jobman doesn't support that at the moment.
Each pod can have multiple containers which again is not something that jobman can handle.
During the execution, you will have access to ephemeral and (maybe) persistent storage.

### Containers

Please keep in mind that the actual storage available during a job execution is ephemeral, unless specifically stated (for instance network mounts like NFS or CEPH).
Be sure to check which locations in the directory structure of the container are actually persistent before launching a workload and risk losing the whole outpuṫ.
You may be able to retrieve data saved on the ephemeral storage, but it depends on the enacted Kubernetes policies (such as container removal operations for completed -- successfully or not -- jobs), therefore we strongly advise against this. 

### Logs 

We are also advising against relying on jobs' logs stored on the Kubernetes job itself (the console stdout and stderr is stored at container level and can be retrieved with the **logs** command).
If you want to avoid losing access to the logs, be sure to store the console output on a non-ephemeral storage location.
If you are interested why, please continue reading through the next paragraph. 

Each time you launch a job, a container is created on a Kubernetes node.
This container occupies not only CPU, RAM, and maybe GPU (if requested), but also disk space.
Once the job execution finishes (successfully or not), the lowest execution unit (the container) frees up the CPU(s), RAM and GPU(s).
The disk space is not released entirely, therefore each time a job ends, more disk space gets used.
Kubernetes has an eviction policy which may remove the containers after a certain time or when the disk capacity 

### Max run time

In order to allow the fair use of the platform, the jobs are not allowed to run forever. Please check the maximum runtime of each flavor by calling **resources-flavors**. The command's output contains the maximum run time allowed on the platform for each resource flavor. If a job doesn't finish within the allotted time, it will be deleted automatically. Please take into account this limitation to avoid losing the progress.

## Server

The OpenAPI specification (Swagger UI) is available under the __/api-docs__ path (e.g. http://localhost:8080/api-docs), accessible when the server application has been started.

## Client

**jobman** can perform multiple operations related to Kubernetes job execution.
Check the full description of comand line arguments in the [usage.md](usage.md) file.

### Settings

Aside from the common ways to load the settings, the client also searches for a settings json in the user's home directory, at __.jobman/settings.json__.
This mecahnism is activated only when the user doesn't specify a settings file via the command line.
The values found in this file override those found in the template.

### Check the images on Harbor

If you have a Harbor instance deployed to manage the images you use on Kubernetes, you can check the available images and their tags using the **images** command:

```jobman images```

### Obtain the description of an image on Harbor

You can get the description of an image stored on Harbor using the **image-details** command. 
You have to specify the image name using the **-i** or **--image** argument following the command. 
The tag of the image is not required, as Harbor stores the description per image not per image/tag combo.

```jobman image-details -i ubuntu_python_tensorflow```

### List the Kubernetes jobs queue

If you want to see how many jobs with a certain requests configuration are active (waiting in the queue or already running), you can use the **queue** command.
Currently, there is no distinction between different GPU extended resources.
Therefore, you have have both Nvidia and AMD, defined by the keys "nvidia.com/gpu" and "amd.com/gpu" respectively, and you launch a job requesting both, **jobman** will sum their count and display it.
You can use flavors to separate various configurations of the resources.

Be careful when launching with your own flavors.
If the name of the flavor is not unique, it can create conflicts within the platform.
Should you name your flavor like an existing, predefined, cluster-wide available flavor, the platform may replace your actual resources configuration with a predefined one.
This normally happens in a cluster that uses a specially defined Kubernetes operator to filter the jobs sent to the Kubernetes queue, and it is part of the security of multi-user environments.
**jobman** cannot know what other flavors + resources configurations are available on other machines, therefore it doens't have the ability to stop you from using a name already in use by someone else for a different resources configuration.
Conflicting flavor names + resources configurations result in the group algorithm of the **queue** command to report in erroneous information.

The output is a table showing:

- what resources configuration are those jobs requesting
- which flavor are they using for their resources configuration (if any, __<no name>__ means the launched jobs' resources configuration has no name defined)
- how many jobs using a certain resources flavor or plain resources request are pending and how many are running. These numbers include your jobs (pending or executing, respectively).

```jobman queue```

### Submit jobs
To actually deploy a job on the Kubernetes cluster, use the **submit** command.
The application' settings include a default image name/tag used if the -i/--image argument is not present.

Do not include private information in the name of the jobs, they can be viewed by others.

- let's list the directories in the root of the job's container; we use the alpine:latest image, since we don't pass a full path to the image, Kubernetes assumes the default repository; for this job, we use a resources flavor without GPU support named "no-gpu"; the -- argument separates the command's arguments from those sent as a command to the job's container

```jobman submit -i alpine -r no-gpu -- ls -al /```

- you can use env variables by passing -e/--env argument to the submit command, just be careful with quoting them; if the commands after the -- argument would not be between single quotes, your local shell (where you execute **jobman**) would try to insert the value of __$MY_VAR__ held in the environment where jobman is executed instead of the job; also, your local shell would interpret && and execute the second ls locally instead of passing the two ls' to the job as command

```jobman submit -i ubuntu-python:latest -r no-gpu -e MY_VAR=/tmp -e ANOTHER_VAR='/opt/my app' -- 'ls -al $MY_VAR && ls -al "$ANOTHER_VAR"'```

- list the available GPUs in a pod launched with GPU support, using the `nvidia-smi` utility; for this job, we use a resources flavor with GPU support named "small-gpu"

```jobman submit -i ubuntu_python_tensorflow:3.1cuda11 -r small-gpu -- sh -c 'nvidia-smi -L'```

- suppose you want to launch something more complex, such as a tensorflow application that needs a gpu using an image called __ubuntu_python_tensorflow:3.1cuda11__; for this job, we use a resources flavor with GPU support named "large-gpu"

```jobman submit -i ubuntu_python_tensorflow:3.1cuda11 -r large-gpu -- python3 -c "exec(\"from tensorflow.python.client import device_lib\ndevice_lib.list_local_devices()\")"```


### List existing jobs

When you want to see what jobs you already launched on Kubernetes, and some additional info such as their status, use the **list** command.
The most important part is the name of the job since it is needed when doing specific operations like getting the log.
This command

```jobman list```

### Get logs

If you want to get the Kubernetes logs for a specific job, you can use the **logs** command that requires the -j/--job-name argument followed by the job name.
To get the job name, check the output of the **submit** command or call **list**.


```jobman logs -j <job_name>```

### Delete a job

If you want to completely remove a job from the Kubernetes cluster, use **delete** followed by the -j/--job-name argument and of course the actual name of the desired job.

```jobman delete -j <job_name>```

### Get details of a job

When you need more details of a specific job, use the **details** command followed by the -j/--job-name argument and of course the actual name of the desired job.

```jobman details -j <job_name>```

## Release

Requirements for both building and running:
- node.js version 22.x or higher
- npm


Due to the requirements on our platform, the release process doesn't create a standard NPM package.
It generates a TAR GZ containing all the files needed for the execution (excluding node and npm).
To do that, run __release.sh__  with one argument, either **client** or **server**, respectively.
A new folder __build__ will be created where the requested **jobman** application will be prepared.
At the end of the release script's execution, if everything went well, you will find a file called __jobman.tar.gz__ containing the application and all its dependencies.


## Docker container

**jobman** server can pe dockerized using the incuded __Dockerfile__.
To build the image, simply run:

```docker build --tag jobman-service:<version> -f ./Dockerfile ./```

## K8s deployment

We provide the necessary recipes for deploying **jobman** on a k8s cluster.
Checkout the __k8s__ folder.
