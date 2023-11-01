exports.ping = (req, res) => {
    res.send('pong');
};

exports.query = async (req, res) => {
    const query_url = `https://www.gulesider.no/${req.query.query_text}/bedrifter`;
    const response = await fetch(query_url);
    const html = await response.text();
    console.log(html.substring(0,100))
    res.send(html);
};