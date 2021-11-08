RegisterNUICallback('getTweets', function (data, cb)
    local info = Phone.TriggerServerEvent('phone:getTweets')
    cb(info)
end)

RegisterNUICallback('createAccount', function (data, cb)
    local account = Phone.TriggerServerEvent('phone:createTwitterAccount', data.name, data.image)
    cb(account)
end)

RegisterNUICallback('deleteAccount', function (data, cb)
    local account = Phone.TriggerServerEvent('phone:deleteTwitterAccount')
    cb(account)
end)

RegisterNUICallback('sendTweet', function (data, cb)
    Phone.TriggerServerEvent('phone:sendTweet', data.tweet)
    cb("OK")
end)

RegisterNUICallback('deleteTweet', function (data, cb)
    Phone.TriggerServerEvent('phone:deleteTweet', data.tweet)
    cb("OK")
end)

RegisterNUICallback('likeTweet', function (data, cb)
    Phone.TriggerServerEvent('phone:likeTweet', data.tweet)
    cb("OK")
end)

RegisterNUICallback('toggleNotifications', function (data, cb)
    Phone.TriggerServerEvent('phone:toggleNotifications')
    cb("OK")
end)

RegisterNetEvent('phone:updateTweets', function (tweets)
    SendNUIMessage({
        app = 'twitter',
        method = 'setTweets',
        data = tweets
    })
end)

RegisterNetEvent('phone:updateAccount', function (account)
    SendNUIMessage({
        app = 'twitter',
        method = 'setAccount',
        data = account
    })
end)