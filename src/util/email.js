const nodemailer = require('nodemailer');

exports.modelo_confirmar_conta = function (nome,token_number) {

    let body = '<html>';
    body += '<head>';
    body += '<title>Search Party - Confirmar Email</title>';
    // body += '<img src="http://thebreja.stormsystem.net.br/img/thebreja.png" width="50px" height="50px">';
    body += '</head>';
    body += '<BODY>';
    body += '<p>Olá ' + nome + '</p>';
    body += '<p>Bem vinda(o) à Search Party<br><br>';
    body += '<a href="http://www.searchparty.com.br/confirmaremail?q=' + token_number + '">clique aqui</a> para confirmar seu email</p>';
    body += '<br><br>  ';
    body += '<p>Dúvidas entre em contato conosco <a href="mailto:otavioprimo@gmail.com?Subject=Contato">contato@searchparty.com.br</a></p>';
    body += '<p>Saiba mais sobre os nossos planos no www.searchparty.com.br/planos</p><br>';
    body += '<footer>Se você não se cadastrou com esse email no aplicativo Search Party, por favor entre em <a href="http://www.searchparty.com.br/faleconosco">contato conosco</a></footer>';
    body += '</BODY>';
    body += '</html>';

    return body;
}

exports.send = function (destinatario_email, html_body, assunto, successCallback, errorCallback) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'otavioprimo@gmail.com', //Troque para o seu email
            pass: '********' //Insira a senha do seu Email aqui
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Search Party App" <otavioprimo@gmail.com>', // sender address
        to: destinatario_email,
        subject: assunto,
        html: html_body // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) errorCallback(error);
        else successCallback(info);
    });
}