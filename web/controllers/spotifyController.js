exports.proxy = async (req, res) => {
    const body = req.body; // e.g { body: null, method: 'GET', path: 'me' }

    const required = ["path", "body", "method", "token"]

    if (required.some((e) => typeof body[e] === "undefined")) {
        res.status(400).send({ "error": "bad" });
    }

    const reqBody = Object.assign({}, {
        method: body.method,
        headers: {
            Authorization: `Bearer ${body.token}`
        }
    }, body.body);

    const response = await send(
        body.path,
        reqBody
    )

    res.send(response)
    //console.log(response.json)
}

async function send(path, body) {
    const base = "https://api.spotify.com/v1/";
    const url = base + path;

    //console.log(url, body)
    const res = await fetch(url, body);

    let json = {};
    let text = "";

    try {
        json = await res.json();
    } catch (ignored) {
        //console.log("failed parsing json")
    }

    try {
        text = await res.text();
    } catch (ignored) {
        //console.log("failed fetching text")
    }

    return {
        response: res,
        code: res.status,
        status: res.statusText,
        json: json
    };
}