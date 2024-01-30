FROM node:15
WORKDIR /app
COPY package.json ./package.json
# RUN npm install
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi
COPY . ./
EXPOSE 3000
CMD [ "node" , "index.js" ]
