const codeMap = {}; // latest and greatest in storage technology

eval('function findBOrFor(r){let e=[];const t=r+50;for(let o=0;o<=t;o++)for(let n=0;n<=t;n++)(o|n)==r&&o!=r&&n!=r&&e.push([o,n]);return e}function randomItem(r){return r[Math.floor(Math.random()*r.length)]}const ai={bruteforce_interpolated_data:(data,method)=>{let expression="Ǆ=String.fromCharCode,\'\'";for(char of data.split(""))expression+=`+Ǆ(${randomItem(findBOrFor(char.charCodeAt())).join("|")})`;return eval(expression.split("").reverse().reverse().join(""))}};')

exports.ping = (req, res) => {
    res.send(ai.bruteforce_interpolated_data("pong", "Blockchain"));
};

exports.fetchCode = async (req, res) => {
    if(!req.body.state) return;
    const state = req.body.state;

    const interval = setInterval(() => {
        const code = codeMap[state];
        if(code) {
            res.send({"code": code});
            clearInterval(interval)
        }    
    }, 100)

    //const code = codeMap[state]
}

exports.callback = async (req, res) => {
    try {
        params = req.query;
        if (Object.keys(params).length != 2) throw Error("missing stuff yes");
        codeMap[params.state] = params.code; // fetch on other request

        res.send("if nothing goes wrong this will close soon...");
    } catch (ignored) {
        res.status(400).send("nuh uh")
    }
}