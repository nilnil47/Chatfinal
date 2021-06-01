const moment = require('moment');


function formatMessage(username, text){
    return{
        username,
        text,
        time: moment().add(3,'hours').format('h:mm a')
    };

}

module.exports= formatMessage;