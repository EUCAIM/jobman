FROM node:24-alpine

COPY jest.config.* release.sh package.json package-lock.json tsconfig.json README.md LICENSE OpenAPI-3.1-specs.json /opt/jobman-build/
COPY src /opt/jobman-build/src
COPY bin /opt/jobman-build/bin

WORKDIR /opt/jobman-build

RUN apk add jq bash \
    && ./release.sh webservice \
    && apk del jq bash \
    && rm -rf /root/.npm \
    && mkdir /opt/jobman \
    && mv /opt/jobman-build/build/* /opt/jobman/ \
    && rm -rf /opt/jobman-build \
    && addgroup -g 1001 jobman \
    && adduser -D -u 1001 -G jobman jobman \
    && chown -R jobman:jobman /opt/jobman

ENV SETTINGS_FILE=/opt/jobman/src/webservice/settings.json

WORKDIR /opt/jobman

USER jobman

ENTRYPOINT ["sh", "-c"]
CMD ["node /opt/jobman/dist/webservice/index.js -s \"$SETTINGS_FILE\""]
