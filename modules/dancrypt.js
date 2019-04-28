const secret = '549842618543765';

function encrypt(text) {
	let temp = '';
	let num = 0;
	let charCode = 0;
	text = text + '';
	for (let i = 0; i < text.length; i++) {
		num = Number(secret.substr(-i, 1));
		charCode = text[i].charCodeAt();
        temp += String.fromCharCode(charCode + num);
    }
	temp = temp.split('').reverse().join('');
	temp = btoa(temp);
	crypt = '';
	for (let i = 0; i < temp.length; i++) {
		num = Number(secret.substr(i, 1));
		charCode = temp[i].charCodeAt();
        crypt += String.fromCharCode(charCode - num);
    }
	crypt = crypt.split('').reverse().join('');
	crypt = btoa(crypt);
	return crypt;
}

function decrypt(crypt) {
	let temp = '';
	let num = 0;
	let charCode = 0;
	crypt = atob(crypt);
	crypt = crypt.split('').reverse().join('');
	for (let i = 0; i < crypt.length; i++) {
		num = Number(secret.substr(i, 1));
		charCode = crypt[i].charCodeAt();
        temp += String.fromCharCode(num + charCode);
    }
	temp = atob(temp);
	temp = temp.split('').reverse().join('');
	text = '';
	for (let i = 0; i < temp.length; i++) {
		num = Number(secret.substr(-i, 1));
		charCode = temp[i].charCodeAt();
        text += String.fromCharCode(charCode - num);
    }
	return text;
}

function btoa(text) {
	return Buffer.from(text).toString('base64');
}

function atob(crypt) {
	return Buffer.from(crypt, 'base64').toString('utf8');
}

module.exports = {enc: encrypt, dec: decrypt};