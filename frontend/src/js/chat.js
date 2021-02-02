export default class Chat {
    constructor(urlWS) {
        this.urlWS = urlWS;
        this.webSocket = new WebSocket(urlWS);
        this.elementForMessagesInDOM = null;
        this.name = '';
    }
    bindInDom() {
        const container = document.querySelector('[data-section=chat]');
        container.insertAdjacentHTML('beforeend', `
        <div class="messager">
        <h3>Чат</h3>
        <div data-area="list-messages"></div>
        <input data-id="newMessage">
        <button data-id="sendNewMessage">Отправить сообщение</button>
        </div>
        `);
        this.elementForMessagesInDOM = container.querySelector('[data-area=list-messages]');
        const input = container.querySelector('[data-id=newMessage]');
        const button = container.querySelector('[data-id=sendNewMessage]');
        button.addEventListener('click', () => {
            if (this.webSocket.readyState === WebSocket.OPEN) {
                this.webSocket.send(JSON.stringify({type: 'addMessage', data: input.value}));
              } else{
              }
        });
    }

    bindInDomName() {
        const container = document.querySelector('[data-section=chat]');
        const name = container.querySelector('[data-section=name]');
        const nameButton = container.querySelector('[data-section=nameok]');
        nameButton.addEventListener('click', () => {
            this.webSocket.send(JSON.stringify({type: 'addUser', data: name.value}));
        });
    }

    subscribeToWS() {
        this.webSocket.addEventListener('open', () => {
            console.log('connected');
            this.webSocket.send(JSON.stringify({type: 'system', data: 'Подключился клиент'}));
          });

          this.webSocket.addEventListener('close', (evt) => {
            console.log('Соединение оборвано', evt);
          });
          
          this.webSocket.addEventListener('error', () => {
            console.log('Ошибка');
          });
          this.webSocket.addEventListener('message', (evt) => {
            const response = JSON.parse(evt.data);
            if (response.type === "addMessage") {
              this.pushMessageInDom(response.data);
            } else if (response.type === "allUsers") {
              console.log(response.data);
            } else {
              console.log(response.data);
            }
          });


    }


    pushMessageInDom(data) {
        this.elementForMessagesInDOM.insertAdjacentHTML('beforeend', `
        <div>${data}</div>
        `);
    }

}