RegisterNUICallback('getPhoneInfo', function (data, cb)
    local info = Phone.TriggerServerEvent('phone:getInfo')
    info.background = GetResourceKvpString('background')
    cb(info)
end)

RegisterNUICallback('setBackground', function (data, cb)
    if data.bg then 
        SetResourceKvp('background', data.bg)
        return
    end

    DeleteResourceKvp('background')
end)