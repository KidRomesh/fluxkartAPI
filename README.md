# fluxkartAPI
Flux Kart API task by Romeshraj S K

Hello everyone,

The task was quite fascinating and I was able to work in Node js after a slight break.

I have taken Nodje js and express framework to create the API and have used Mongo Atlas for better reachability.

Hence no need to setup database in local system. The API is exposed and will be up and running.

Kindly follow the below steps and proceed ahead with the testing and to see the processing of the API.

1. connect to the POSTMAN tool
2. use the link: "" and connect to the exposed API
3. send data in the following format as a json
{
"email": "abc@gmail.com",
"phoneNumber":"1234567890"
}
Note : no authorization is required this is an open API which is exposed through heroku

You will get the valid response as below
{
        "contact": {
            "primaryContactd": 1,
            "emails": ["abc@gmail.com","def@gmail.com"],
            "phoneNumbers": ["1234567890","0987654321"],
            "secondaryContactIds": [23]
        }
}
In case you need to know all the users : ""
Or if you wish to delete the user : ""

I would like to thank the Bitespeed team for providing me this opportunity to work on the task and complete it in flying colors.

Regards
Romeshraj S K  

