const http = require('http');
http.get('http://localhost:3000/auth/login', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log(data.substring(data.indexOf('<main'), data.indexOf('</main>'))));
});
