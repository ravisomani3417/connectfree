module.exports = (text = '') => [...new Set((text.match(/#\w+/g) || []).map((h) => h.slice(1).toLowerCase()))];
