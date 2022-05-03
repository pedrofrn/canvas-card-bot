console.log('////////////// canvasCardBot //////////////')

const { Telegraf, Markup } = require('telegraf');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const tokenBot = '5333495388:AAFN0R7fYxnYN1IaFUsDszckuv9j6iHWr-8';
const bot = new Telegraf(tokenBot);

let unidade, titulo, corpo, link, image, step = 1;

const unidadesObj = {
    'IF Baiano (principal)': 'ifbaiano',
    'Campus Alagoinhas': 'alagoinhas',
    'Campus Bom Jesus da Lapa': 'lapa',
    'Campus Catu': 'catu',
    'Campus Governador Mangabeira': 'gmb',
    'Campus Guanambi': 'guanambi',
    'Campus Itaberaba': 'itaberaba',
    'Campus Itapetinga': 'itapetinga',
    'Campus Santa Inês': 'santaines',
    'Campus Senhor do Bonfim': 'bonfim',
    'Campus Serrinha': 'serrinha',
    'Campus Teixeira de Freitas': 'teixeira',
    'Campus Uruçuca': 'urucuca',
    'Campus Valença': 'valenca',
    'Campus Xique-Xique': 'xiquexique'
}

// início do chat com o bot
bot.start((ctx) => {
    step = 1
    ctx.reply(`Olá, ${ctx.chat.first_name}. Eu sou um robô de atendimento`);
    setTimeout(() => {
        ctx.reply(`Em que posso te ajudar?`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Informações', callback_data: 'info' }
                        ],
                        [
                            { text: 'Fazer card', callback_data: 'card' }
                        ],
                        [
                            { text: 'Acessar a página na internet', url: 'https://pedrofrn.github.io/canvas-card/' }
                        ]
                    ],
                    one_time_keyboard: true
                }
            }
        )
    }, 1500);

    // seção de informações
    bot.action('info', async ctx => {
        ctx.reply(`Robô de conversa que entrega uma imagem com os dados fornecidos pelo usuário.`);
        setTimeout(() => ctx.reply(`Esta aplicação foi desenvolvida em JavaScript, funciona em NodeJs e utiliza as bibliotecas Telegraf, Puppeteer e File system.`), 1000);
        setTimeout(() => ctx.reply(`Acesse a página do GitHub do criador https://github.com/pedrofrn`), 2000);
    })

    // início do processo de criação do card
    bot.action('card', async ctx => {
        await ctx.answerCbQuery()
        let toUser = ctx.chat.id;
        ctx.reply(`Vamos começar a criação do card.`)
        setTimeout(() => ctx.reply(`Solicitarei algumas informações.`), 1000);
        setTimeout(() => {
            ctx.reply('Selecione a unidade desejada',
                {
                    reply_markup: {
                        keyboard: [ // botões
                            [
                                { text: 'IF Baiano (principal)', callback_data: 'ifbaiano' }
                            ],
                            [
                                { text: 'Campus Alagoinhas', callback_data: 'alagoinhas' }
                            ],
                            [
                                { text: 'Campus Bom Jesus da Lapa', callback_data: 'lapa' }
                            ],
                            [
                                { text: 'Campus Catu', callback_data: 'catu' }
                            ],
                            [
                                { text: 'Campus Governador Mangabeira', callback_data: 'gmb' }
                            ],
                            [
                                { text: 'Campus Guanambi', callback_data: 'guanambi' }
                            ],
                            [
                                { text: 'Campus Itaberaba', callback_data: 'itaberaba' }
                            ],
                            [
                                { text: 'Campus Itapetinga', callback_data: 'itapetinga' }
                            ],
                            [
                                { text: 'Campus Santa Inês', callback_data: 'santaines' }
                            ],
                            [
                                { text: 'Campus Senhor do Bonfim', callback_data: 'bonfim' }
                            ],
                            [
                                { text: 'Campus Serrinha', callback_data: 'serrinha' }
                            ],
                            [
                                { text: 'Campus Teixeira de Freitas', callback_data: 'teixeira' }
                            ],
                            [
                                { text: 'Campus Uruçuca', callback_data: 'urucuca' }
                            ],
                            [
                                { text: 'Campus Valença', callback_data: 'valenca' }
                            ],
                            [
                                { text: 'Campus Xique-Xique', callback_data: 'xiquexique' }
                            ]
                        ],
                        one_time_keyboard: true
                    }
                }
            )
        }, 2000);

        // start no navegador e preenchimento do formulário
        async function canvasCard(unidade, titulo, corpo, link, toUser, ctx) {
            const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.goto('https://pedrofrn.github.io/canvas-card/');

            const select = await page.select('.unidades', unidadesObj[unidade]);
            if (!select) canvasCard(unidade, titulo, corpo, link, toUser, ctx);
            await page.click('div[id="content"]');
            await page.type('#title', titulo);
            await page.type('#textBody', corpo);
            await page.type('#link', link);
            await page.click('button[id="generate"]');

            setTimeout(async () => await page.click('a[id="downloadLnk"]'), 4000);

            // manipulação de código database64 e envio ao usuário do card concluído
            setTimeout(async () => {
                image = await page.$eval('a#downloadLnk', a => a.getAttribute('href'));
                let base64Image = image.split(';base64,').pop();
                let fileName = `card-${unidadesObj[unidade]}-${toUser}.jpg`
                image = await fs.writeFile(fileName, base64Image, { encoding: 'base64' }, function (err) {
                    console.log(err);
                })
                ctx.replyWithPhoto({ source: fileName })
                ctx.reply(`Segue seu card, ${ctx.chat.first_name} 🎉`)
                await browser.close();
                //step = 1;
                console.log(`Imagem enviada com sucesso a ${ctx.chat.first_name}, ID ${ctx.chat.id}.`)
                console.log('////////////// Encerrado //////////////');
                return;
            }, 10000);

            return;
        }

        // listener de mensagens e fluxo da conversa
        bot.on('message', async message => {
            if (step === 1 || step === 4) await receiveMessage(step, message.message.text);
            if ((step === 2 && message.message.text.length > 3) || (step === 3 && message.message.text.length > 5)) {
                await receiveMessage(step, message.message.text);
            }
            if ((step === 2 && message.message.text.length <= 3) || (step === 3 && message.message.text.length <= 5)) {
                ctx.reply('Por favor, digite um texto com mais de 5 caracteres');
                return;
            }

            step++;
            if (step === 2) setTimeout(() => ctx.reply('Escreva o título do card (até 90 caracteres)'), 1500);
            if (step === 3) setTimeout(() => ctx.reply('Digite o corpo de texto do card (até 370 caracteres)'), 1500);
            if (step === 4) {
                setTimeout(() => {
                    ctx.reply(`Deseja inserir algum link/URL?\nCaso não informe algum endereço, o URL do ${unidade} será utilizado`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: 'Sim', callback_data: 'sim' }, { text: 'Não', callback_data: 'nao' }
                                    ]
                                ],
                                one_time_keyboard: true
                            }
                        }
                    )
                }, 1500);
                bot.action('sim', (ctx) => ctx.reply('Digite o endereço do link'));
                bot.action('nao', () => {
                    receiveMessage(step, '');
                    step++;
                    setTimeout(async () => {
                        ctx.reply(`Pronto! Por favor, aguarde alguns segundos.\nEstou montando seu card 🦾`);
                        await canvasCard(unidade, titulo, corpo, link, toUser, ctx);
                    }, 1000);
                });
            }
            if (step === 5) setTimeout(async () => {
                ctx.reply(`Pronto! Por favor, aguarde alguns segundos.\nEstou montando seu card 🦾`);
                await canvasCard(unidade, titulo, corpo, link, toUser, ctx);
            }, 1000);

            if (step === 6) setTimeout(() => ctx.reply('🤖'), 1500);
            if (step > 6) setTimeout(() => ctx.reply('Quer alguma ajuda? Acesse meu comando principal com\n\n/start'), 1500);
            return;
        })
    })

    // captura e atribuição de valor às variáveis principais
    async function receiveMessage(step, message) {
        if (step === 1) {
            unidade = await message;
            console.log('Unidade: ', unidade);
        };
        if (step === 2) {
            titulo = await message;
            console.log('Título: ', titulo);
        };
        if (step === 3) {
            corpo = await message;
            console.log('Corpo: ', corpo);
        };
        if (step === 4) {
            link = await message;
            console.log('Link: ', link === '' ? 'Não fornecido' : link);
        };
    }
})

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));