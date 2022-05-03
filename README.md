# canvasCardBot

Bot de conversa do Telegram que interage com outra aplicação, o [Construtor de card](https://github.com/pedrofrn/canvas-card), e entrega uma imagem ao usuário com informações fornecidas durante o chat.

### Sobre o funcionamento

O robô consiste em um código JavaScript que, rodando no NodeJS e fazendo o uso do framework Telegraf, possibilita a interação com um usuário, requisitando deste informações para a construção de uma imagem gerada na tag <canvas> do HTML. Após a coleta de alguns dados, o código utiliza o Puppeteer para preencher o formulário no endereço [https://pedrofrn.github.io/canvas-card/](https://pedrofrn.github.io/canvas-card/), gerar e baixar uma imagem personalizada, então instancia a biblioteca File system para baixar o arquivo localmente e disponibilizá-lo no chat do Telegram.
  
  
O bot está hospedado no Heroku e disponível para uma conversa em [https://t.me/canvascardbot](https://t.me/canvascardbot).
