Phone.RegisterEvent('phone:getChat', function (src, number)
    local phone = GetPlayerPhone(src)
    local messages = phone.getMessages()
    return messages[tostring(number)]
end)

Phone.RegisterEvent('phone:getMessages', function (src)
    local phone = GetPlayerPhone(src)
    return FormatMessages(phone)
end)

Phone.RegisterEvent('phone:sendMessage', function (src, msg, number, coords)
    local phone = GetPlayerPhone(src)
    local target = GetPlayerPhone(GetPlayerFromPhone(number))
    phone.addMessage(number, msg, coords)

    if Config.UsingESX then 
        for k,v in pairs(ESX.GetPlayers()) do 
            local xPlayer = ESX.GetPlayerFromId(k)
            if xPlayer then 
                local job = xPlayer.getJob()
                if job.name == number then 
                    local target = GetPlayerPhone(k)
                    target.addMessage(phone.number, msg, coords)
                    TriggerClientEvent('phone:notify', k, job.name, job.label .. ' Request', msg, {dispatch = true, coords = coords, timeout = 20000, sound = 'dispatch.mp3'})
                end
            end
        end
    end

    if not target then 
        MySQL.Async.fetchAll("SELECT * FROM phones WHERE phone_number=@number",
        {
            ["@number"] = number,
        }, function (result)
            if result[1] then 
                local messages = json.decode(result[1].messages)

                if messages then 
                    if messages[phone.number] then 
                        table.insert(messages[phone.number], {number = phone.number, msg = msg, date = os.time()})
                    else 
                        messages[phone.number] = {{number = phone.number, msg = msg, date = os.time()}}
                    end
                else 
                    messages = {}
                    messages[phone.number] = {{number = phone.number, msg = msg, date = os.time()}}
                end

                MySQL.Async.execute("UPDATE phones SET messages=@messages WHERE phone_number=@number",
                {
                    ["@number"] = number,
                    ["@messages"] = json.encode(messages)
                }, function () end)
            end
        end)
    else 
        local messages = target.getMessages()
        local contacts = target.getContacts()

        if messages[phone.number] then 
            table.insert(messages[phone.number], {number = phone.number, msg = msg, date = os.time(), coords = coords})
        else 
            messages[phone.number] = {{number = phone.number, msg = msg, date = os.time(), coords = coords}}
        end

        target.setMessages(messages)
        TriggerClientEvent('phone:updateChat', target.source, phone.number, messages[phone.number])
        
        local name = IsNumberInContacts(contacts, phone.number)
        TriggerClientEvent('phone:notify', target.source, 'messages', name, msg, {number = phone.number, name = name, sound = 'notify.mp3'})
        TriggerClientEvent('phone:updateMessages', target.source, FormatMessages(target))
    end

    TriggerClientEvent('phone:updateMessages', src, FormatMessages(phone))

    return phone.getMessages()[tostring(number)]
end)

RegisterNetEvent('phone:dispatch', function (id, msg, coords)
    if Config.UsingESX then 
        for k,v in pairs(ESX.GetPlayers()) do 
            local xPlayer = ESX.GetPlayerFromId(k)
            if xPlayer then 
                local job = xPlayer.getJob()
                if job.name == id then 
                    local target = GetPlayerPhone(k)
                    target.addMessage(id, msg, coords)
                    TriggerClientEvent('phone:notify', k, job.name, job.label .. ' Request', msg, {dispatch = true, coords = coords, timeout = 20000, sound = 'dispatch.mp3'})
                end
            end
        end
    end 
end)

function IsNumberInContacts(contacts, number)
    local val = number
    for k,v in pairs(contacts) do 
        if number == v.number then 
            val = v.name
        end
    end
    return val
end

function FormatMessages(phone)
    if not phone then return end

    local messages = phone.getMessages()
    local contacts = phone.getContacts()

    local msgs = {}

    for k,v in pairs(messages) do 
        table.insert(msgs, {
            msg = v[#v].msg,
            author = IsNumberInContacts(contacts, k),
            number = k,
            date = v[#v].date
        })
    end

    table.sort(msgs, function(a,b) return tonumber(a.date) > tonumber(b.date) end)

    local formated = {}
    for i=1, 10 do
        table.insert(formated, msgs[i])
    end

    return formated
end
