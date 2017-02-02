'use strict'

var Botkit = require('botkit');
var watson = require('watson-developer-cloud');
var conversation = watson.conversation({
  username: process.env.USER_NAME_WATSON,
  password: process.env.PASSWORD_WATSON,
  version: 'v1',
  version_date: '2016-09-20'
});
console.log(conversation);
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const token = process.env.FB_PAGE_ACCESS_TOKEN
var context = {};

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

// API endpoint to index.js to process messages
app.post('/webhook/', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  // console.log('messaging_events');
  // console.log(messaging_events);
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    console.log('got message from - ');
    console.log(event.sender);
    if (event.message && event.message.text) {
      let text = event.message.text
      sendToWatson(sender, text, context);
      // if (text.includes("הרצאה")) {
      //   sendTextMessage(sender, "שאלה מצוינת! התשובה נמצאת בלוח האירועים של הפרויקט: https://www.facebook.com/tvpcenterisrael/events?ref=page_internal")
      // } else {
      //   sendCardsMessage(sender);
      // }
      continue;
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      sendTextMessage(sender, "קיבלתי, אני צריך עוד קצת זמן כדי להשתפר...  :) ממליץ בנתיים לבדוק את האתר שלנו: http://www.discovervenus.com", token)
      continue
    }
  }
  res.sendStatus(200)
  // to get user info - https://developers.facebook.com/docs/messenger-platform/user-profile
})


// function to echo back messages
function sendTextMessage(sender, text) {
  'use strict'
  let messageData = { text:text }
  request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
      }, function(error, response, body) {
          if (error) {
              console.log('Error sending messages: ', error)
          } else if (response.body.error) {
              console.log('Error: ', response.body.error)
          }
      })
}

//  send an test message back as two cards.
function sendCardsMessage(sender, message) {
  'use strict'
  let messageDataToSend = {}
  if (!message) {
    let messageData1 = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                  {
                      "title": "אבטלה טכנולוגית",
                      "subtitle": "מה שמצפה לנו מעבר לפינה",
                      "image_url": "http://1ynx.ru/up/14-07/07-6985-tvp_icon.png",
                      "buttons": [{
                          "type": "web_url",
                          "title": "תן לי אותו דוקטור",
                          "url": "https://www.youtube.com/watch?v=gU84axWi1WQ",
                      }, {
                          "type": "postback",
                          "title": "רוצה לשמוע עוד בנושא",
                          "payload": "Payload for first element in a generic bubble",
                      }],
                  },
                  {
                    "title": "שיחת פתיחה",
                    "subtitle": "היכרות עם הפרויקט ומה אנחנו מציעים",
                    "image_url": "http://1ynx.ru/up/14-07/07-6985-tvp_icon.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.youtube.com/watch?v=JFJaLI9rBAg",
                        "title": "תן בראש"
                    }, {
                        "type": "postback",
                        "title": "רוצה לשמוע עוד בנושא",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }]
            }
        }
    }
    let messageData2 = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                  {
                    "title": "אז איפה מתחילים?",
                    "subtitle": "היכרות עם הפרויקט ומה אנחנו מציעים",
                    "image_url": "http://1ynx.ru/up/14-07/07-6985-tvp_icon.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.youtube.com/watch?v=JFJaLI9rBAg",
                        "title": "תן בראש"
                    }, {
                        "type": "postback",
                        "title": "רוצה לשמוע עוד בנושא",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                  },
                  {
                      "title": "למה צריך בני אדם?",
                      "subtitle": "מה שמצפה לנו מעבר לפינה",
                      "image_url": "http://1ynx.ru/up/14-07/07-6985-tvp_icon.png",
                      "buttons": [{
                          "type": "web_url",
                          "title": "תן לי אותו דוקטור",
                          "url": "https://www.youtube.com/watch?v=gU84axWi1WQ",
                      }, {
                          "type": "postback",
                          "title": "רוצה לשמוע עוד בנושא",
                          "payload": "Payload for first element in a generic bubble",
                      }],
                  },
                ]
            }
        }
    }

    messageDataToSend = ( Math.random() > 0.5 ) ? messageData1 : messageData2;
  } else { messageDataToSend = { text: message }}

  request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageDataToSend,
        }
      }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })

}

function sendToWatson(sender, text, context) {
  // Replace with the context obtained from the initial request
  conversation.message({
    workspace_id: process.env.WATSON_WORKSPACE_ID,
    input: {'text': text},
    context: context
  },  function(err, response) {
      if (err) {
        console.log('error:', err);
      } else {
        console.log(JSON.stringify(response, null, 2));
        if (response.output.text[0] === "cards") {
          sendCardsMessage(sender);
        } else {
          sendTextMessage(sender, response.output.text[0]);
        }
      }
    }
  );
}
