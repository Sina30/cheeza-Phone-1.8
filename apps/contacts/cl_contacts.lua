RegisterNUICallback('getContacts', function (data, cb)
    local contacts = Phone.TriggerServerEvent('phone:getContacts')

    if contacts then 
        cb(contacts)
    else 
        cb({})
    end
end)

RegisterNUICallback('addContact', function (data, cb)
    local contacts = Phone.TriggerServerEvent('phone:addContact', data.id, data.number, data.name)

    if contacts then 
        cb(contacts)
    else 
        cb({})
    end
end)

RegisterNUICallback('editContact', function (data, cb)
    local contacts = Phone.TriggerServerEvent('phone:editContact', data.id, data.name, data.number)

    if contacts then 
        cb(contacts)
    else 
        cb({})
    end
end)

RegisterNUICallback('deleteContact', function (data, cb)
    local contacts = Phone.TriggerServerEvent('phone:deleteContact', data.id)

    if contacts then 
        cb(contacts)
    else 
        cb({})
    end
end)