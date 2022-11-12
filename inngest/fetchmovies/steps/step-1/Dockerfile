FROM node:16.15-stretch-slim
WORKDIR /opt/
COPY package*.json *lock src /opt/ 
RUN npm ci --production
ENTRYPOINT ["./node_modules/.bin/inngest-init", "./index.js"]
