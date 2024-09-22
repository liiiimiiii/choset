FROM node:latest

WORKDIR /home/choreouser

EXPOSE 8080

COPY web/* /home/choreouser/

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y iproute2 vim netcat-openbsd && \
    addgroup --gid 10008 choreo && \
    adduser --disabled-password --no-create-home --uid 10008 --ingroup choreo choreouser && \
    usermod -aG sudo choreouser && \
    chmod +x /home/choreouser/index.js /home/choreouser/swith /home/choreouser/web && \
    npm install && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

CMD [ "node", "index.js" ]

USER 10008
