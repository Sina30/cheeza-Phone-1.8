Phones = {}

ESX = nil 
TriggerEvent('esx:getSharedObject', function (obj)
    ESX = obj
end)

if Config.MultiChar and Config.UsingESX then 
    AddEventHandler('esx:playerLogout', function(src)
        local name = GetPlayerName(src)
        local phone = GetPlayerPhone(src)
    
        if phone then 
            SavePhone(phone, function ()
                print(("^5[Phone]^7 Phone Saved (%s)!"):format(name))
                Phones[src] = nil
            end)
        end
	end)
end

RegisterNetEvent('phone:loadPhone', function ()
    local src = source

    if not Phones[src] then 
        local uid = GetUserLicense(src)
        local found = promise.new()

        if Config.MultiChar and Config.UsingESX then 
            local xPlayer = ESX.GetPlayerFromId(src)
            uid = xPlayer.getIdentifier()
        end
    
        GetPhoneFromDB(uid, function (data)
            if data then 
                found:resolve(data)
            else 
                local number = GenerateNumber()
                MySQL.Async.execute('INSERT INTO phones (identifier, phone_number) VALUES (@id, @phonenumber)',
                {
                    ["@id"] = uid,
                    ["@phonenumber"] = number
                }, function ()
                    GetPhoneFromDB(uid, function (nData)
                        found:resolve(nData)
                    end)
                end)
            end
        end)
    
        local phoneData = Citizen.Await(found)
        local phone = CreatePhone(src, uid, phoneData.phone_number, phoneData.contacts, phoneData.messages, phoneData.accounts, phoneData.gallery)
        Phones[src] = phone
        TriggerClientEvent('phone:loaded', src)
        print(("^5[Phone]^7 Loaded Phone (%s)!"):format(GetPlayerName(src)))
    end
end)

Phone.RegisterEvent('phone:attemptCall', function (source, number)
    local phone = GetPlayerPhone(source)
    local target = GetPlayerFromPhone(number)

    if phone.number == number then 
        return true
    end

    TriggerClientEvent('phone:notify', source, 'phone', IsNumberInContacts(phone.getContacts(), number), '', {caller = true, number = number})

    if target then 
        local targetPhone = GetPlayerPhone(target)
        if targetPhone then 
            TriggerClientEvent('phone:notify', target, 'phone', IsNumberInContacts(targetPhone.getContacts(), phone.number), '', {caller = false, number = phone.number})
        end
    end
end)

Phone.RegisterEvent('phone:answerCall', function (source, number)
    local phone = GetPlayerPhone(source)
    local target = GetPlayerFromPhone(number)
    local targetPhone = GetPlayerPhone(target)

    if Config.VOIP:match('salt') then 
        exports[Config.VOIP]:AddPlayerToCall(number, source)
        exports[Config.VOIP]:AddPlayerToCall(number, target)
    end

    TriggerClientEvent('phone:answerCall', source, number)
    TriggerClientEvent('phone:answerCall', target, number)
end)

Phone.RegisterEvent('phone:declineCall', function (source, number)
    local phone = GetPlayerPhone(source)
    local target = GetPlayerFromPhone(number)

    TriggerClientEvent('phone:declineCall', source)
    if Config.VOIP:match('salt') then 
        exports[Config.VOIP]:RemovePlayerFromCall(number, source)
    end

    if target then 
        TriggerClientEvent('phone:declineCall', target)
        if Config.VOIP:match('salt') then 
            exports[Config.VOIP]:RemovePlayerFromCall(number, target)
        end
    end
end)

Phone.RegisterEvent('phone:reset', function (source)
    local phone = GetPlayerPhone(source)
    phone.reset()
end)

Phone.RegisterEvent('phone:gotItem', function (src)
    if Config.UsingESX and Config.RequireItem then 
        local xPlayer = ESX.GetPlayerFromId(src)

        if xPlayer.getInventoryItem('phone').count > 0 then 
            return true
        end

        return false
    else 
        return true
    end
end)

AddEventHandler('playerDropped', function ()
    local src = source
    local name = GetPlayerName(src)
    local phone = GetPlayerPhone(src)

    if phone then 
        SavePhone(phone, function ()
            print(("^5[Phone]^7 Phone Saved (%s)!"):format(name))
            Phones[src] = nil
        end)
    end
end)