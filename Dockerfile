FROM node:8.11

COPY . /home/tic-tac-toe
WORKDIR /home/tic-tac-toe
RUN rm -rf node_modules/*
RUN npm install
RUN npm install --save
RUN npm install ganache-cli -g 
CMD [ "./sleepforever.sh" ]

