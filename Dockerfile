FROM node:24-alpine

LABEL name=jobman-webservice
LABEL authors="Andy S Alic (asalic)"

COPY jest.config.* package.json tsconfig.json README.md LICENSE OpenAPI-3.1-specs.json /opt/jobman/
COPY src /opt/jobman/src
COPY bin /opt/jobman/bin

WORKDIR /opt/jobman

RUN npm install \
    && npx tsc \
    && rm -rf /root/.npm \
    && ln -s /opt/jobman/bin/jobman-webservice /usr/bin/ \
    && chmod +x /opt/jobman/bin/jobman-webservice \
    && addgroup -g 1001 jobman \
    && adduser -D -u 1001 -G jobman jobman

ENV SETTINGS_FILE=/opt/jobman/src/webservice/settings.json

USER jobman

ENTRYPOINT ["jobman-webservice"] 
CMD ["-s", "/opt/jobman/settings.json"]
