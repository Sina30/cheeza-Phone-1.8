RegisterNUICallback('getMessages', function (data, cb)
    local messages = Phone.TriggerServerEvent('phone:getMessages')
    if messages then 
        cb(messages)
    else 
        cb({})
    end
end)

RegisterNUICallback('getChat', function (data, cb)
    local messages = Phone.TriggerServerEvent('phone:getChat', data.number)
    if messages then 
        cb(messages)
    else 
        cb({})
    end
end)

RegisterNUICallback('sendMessage', function (data, cb)
    local coords = nil
    
    if data.coords then 
        coords = GetEntityCoords(PlayerPedId())
        coords = {coords.x, coords.y}
    end

    local messages = Phone.TriggerServerEvent('phone:sendMessage', data.msg, data.number, coords)
    if messages then 
        cb(messages)
    else 
        cb({})
    end
end)

RegisterNUICallback('setWaypoint', function (data, cb)
    if data.coords then 
        SetNewWaypoint(data.coords[1], data.coords[2])
    end
end)

RegisterNetEvent('phone:updateMessages', function (msgs)
    SendNUIMessage({
        app = 'messages',
        method = 'setMessages',
        data = msgs
    })
end)

RegisterNetEvent('phone:updateChat', function (number, msgs)
    SendNUIMessage({
        app = 'messages',
        method = 'setChat',
        data = {num = number, chat = msgs}
    })
end)