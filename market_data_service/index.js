// market data service

import express from 'express';
import dotenv from "dotenv"
import UpstoxClient from "upstox-js-sdk";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors());
const port = 4000;

const authurlfortoken_sample = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=600c18c0-401c-4387-96e2-ee6d15cc83bb&redirect_uri=https%3A%2F%2Flocalhost%3A4000`;


app.get('/', async (req, res) => {
   res.json({ message: "Trade-Wise Stock Broker Order Executioner Service" });
});

// Endpoint just to login upstox API
app.get('/getDataFromUpstox', (req, res) => {
   loginToUpstox();
   res.json({ message: "Succeeded" });
});

// Function to generate access token to use upstox API
const loginToUpstox = () => {
    const apiInstance = new UpstoxClient.LoginApi();
    const apiVersion = "2.0";
    const opts = {
        code: process.env.AUTH_CODE,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
        grantType: "authorization_code",
    };
    apiInstance.token(apiVersion, opts, (error, data, response) => {
        if (error) {
            console.log("Error occurred: ", error);
            console.log("Full Error Response: ", error.response?.body); // Log full error
        } else {
            console.log('Access Token - ', data["accessToken"]);
            console.log("API called successfully. Returned data: " + JSON.stringify(data));
        }
    });
};

// OHLC - open, high, low, close market quotes for particular stocks
app.get("/getOHLCData", (req, res) => {
   console.log("Getting OHLC route");
   const symbol = req.query.symbol;
   getMarketQuoteOHLC(symbol, (err, data) => {
       if (err) {
           res.status(500).json("failed")
       } else {
           res.status(200).json(data)
       }
   });
});

const getMarketQuoteOHLC = (symbol, callback) => {
   let defaultClient = UpstoxClient.ApiClient.instance;
   var OAUTH2 = defaultClient.authentications["OAUTH2"];
   OAUTH2.accessToken = process.env.ACCESS_TOKEN;
   let apiInstance = new UpstoxClient.MarketQuoteApi();
   let apiVersion = "2.0";
   //let symbol = "NSE_EQ|INE669E01016";
   let interval = "1d";
   apiInstance.getMarketQuoteOHLC(
       symbol,
       interval,
       apiVersion,
       (error, data, response) => {
           if (error) {
               console.error(error);
               callback(err, null)
           } else {
               console.log(
                   "API called successfully. Returned data: " + JSON.stringify(data)
               );
               callback(null, data)
           }
       }
   );
};

// get historical data
// app.get("/getHistoricalData", (req, res) => {
//     console.log("Getting Historical route");
//     const symbol = req.query.symbol;
//     getHistoricalData(symbol, (err, data) => {
//         if (err) {
//             res.status(500).json("failed")
//         } else {
//             res.status(200).json(data)
//         }
//     });
//  });

//  const getHistoricalData = (symbol, callback) => {
//     let apiInstance = new UpstoxClient.HistoryApi();
//     let apiVersion = "2.0"; 
//     let interval = "1minute"; 
//     let toDate = "2024-05-12";
//     let fromDate = "2024-05-10";

//     apiInstance.getHistoricalCandleData1(symbol, interval, toDate, fromDate,apiVersion, (error, data, response) => {
//         if (error) {
//         console.error(error);
//         callback(err, null)
//         } else {
//         console.log('API called successfully. Returned data: ' + JSON.stringify(data));
//         callback(null, data)
//         }
//     });
//  }

// get monthly candles
app.get("/getDataMonthlyInterval", (req, res) => {
    const instrumentKey = req.query.instrumentKey;
    let apiVersion = "2.0";
    let interval = "month";
    let toDate = "2024-05-12";
    let fromDate = "2023-05-12";

    let defaultClient = UpstoxClient.ApiClient.instance;
    var OAUTH2 = defaultClient.authentications["OAUTH2"];
    OAUTH2.accessToken = process.env.ACCESS_TOKEN;
    let apiInstance = new UpstoxClient.HistoryApi();
    apiInstance.getHistoricalCandleData1(instrumentKey, interval, toDate, fromDate, apiVersion, (error, data, response) => {
        if (error) {
            res.status(500).json({"error": error})
        } else {
            res.status(200).json({"data": data.data})
            console.log(
                "API called successfully. Returned data: " + JSON.stringify(data)
            );
        }
    });
})


app.listen(port, () => {
   console.log(`Server is listening at http://localhost:${port}`);
})

