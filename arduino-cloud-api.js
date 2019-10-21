// MIT License
// Copyright (c) 2019 ilcato
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Arduino cloud api
'use strict';

const request = require('request');
const ArduinoIotClient = require('@arduino/arduino-iot-client');
const client = ArduinoIotClient.ApiClient.instance;
//Only for dev
client.basePath='http://api-dev.arduino.cc/iot';
// Configure OAuth2 access token for authorization: oauth2
var oauth2 = client.authentications['oauth2'];
const apiProperties = new ArduinoIotClient.PropertiesV2Api(client);
const apiSeries = new ArduinoIotClient.SeriesV2Api(client);
const apiThings = new ArduinoIotClient.ThingsV2Api(client);

const authUrl =
  process.env.AUTH_API_BASE_URL || 'https://auth-dev.arduino.cc/v1';

function log(title, msg) {
  console.log(`[${title}] ${msg}`);
}
class ArduinoCloudClient {
  constructor(token) {
    this.token = token;
    oauth2.accessToken = token;
  }
  updateToken(token) {
    this.token = token;
    oauth2.accessToken = token;
  }
  getUserId() {
    const url = `${authUrl}/users/byID/me`;
    return this.genericRequest(url, 'get', '');
  }
  setProperty(thing_id, property_id, value) {
    const body = JSON.stringify({
      value: value
    });
    return apiProperties.propertiesV2Publish(thing_id, property_id, body);
  }
  getThings() {
    return apiThings.thingsV2List();
  }
  getProperties(thingId) {
    return apiProperties.propertiesV2List(thingId);
  }
  getProperty(thingId, propertyId) {
    return apiProperties.propertiesV2Show(thingId, propertyId);
  }
  getSeries(thingId, propertyId, start, end) {

    const body =  JSON.stringify({
      requests: [{
        q: "property." + propertyId,
        from: start,
        to: end,
        sort: "ASC",
        series_limit: 86400
      }],
      resp_version: 1
    });
    return apiSeries.seriesV2BatchQueryRaw(body);
  }
  genericRequest(url, method, body) {
    const p = new Promise((resolve, reject) => {
      const headers = {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      };
      request(
        {
          url: url,
          method: method,
          body: body,
          headers: headers
        },
        (err, response, body) => {
          if (!err && response.statusCode === 200) {
            if (body) resolve(JSON.parse(body));
            else resolve();
          } else reject(err);
        }
      );
    });
    return p;
  }
}
exports.ArduinoCloudClient = ArduinoCloudClient;
