function GetPlayerPhone(src) 
    return Phones[tonumber(src)]
end

function GetUserLicense(src)
    local license 
    for k,v in pairs(GetPlayerIdentifiers(src)) do 
        if string.match(v, 'license:') then 
            license = string.gsub(v, 'license:', '')
        end
    end
    return license
end

function CheckNumber(number)
    local p = promise.new()
    MySQL.Async.fetchScalar("SELECT COUNT(1) FROM phones WHERE phone_number=@number", 
    {
        ["@number"] = number
    }, function (count)
        if count > 0 then 
            p:resolve(false)
        else 
            p:resolve(true)
        end
    end)
    return Citizen.Await(p)
end

function GenerateNumber()
    math.randomseed(os.clock()*100000000000)
    while true do 
        Wait(1)
        local num1 = tostring(math.random(100, 900))
        local num2 = tostring(math.random(100, 900))
        local formattedNumber = Config.StartingDigits..num1..num2
        if CheckNumber(formattedNumber) then 
            return formattedNumber
        end
    end
end

function GetPhoneFromDB(uid, cb)
    MySQL.Async.fetchAll('SELECT * FROM phones WHERE identifier=@id', 
    {
        ["@id"] = uid
    }, function (result)
        cb(result[1])
    end)
end

function GetPlayerFromPhone(number)
    for k,v in pairs(Phones) do 
        if v.number == number then 
            return k
        end
    end
end

function SavePhone(phone, cb)
    local p = promise.new()
    MySQL.Async.execute("UPDATE phones SET contacts=@contacts, messages=@messages, accounts=@accounts, gallery=@gallery WHERE phone_number=@number AND identifier=@uid", 
    {
        ["@uid"] = phone.getUID(),
        ["@number"] = phone.getNumber(),
        ["@contacts"] = json.encode(phone.getContacts()),
        ["@messages"] = json.encode(phone.getMessages()),
        ["@accounts"] = json.encode(phone.getAccounts()),
        ["@gallery"] = json.encode(phone.getGallery())
    }, function ()
        if cb then 
            cb()
        end
        p:resolve()
    end)
    return Citizen.Await(p)
end

function startSave()
    CreateThread(function()
		while true do
			Wait(60000 * Config.SaveInterval)

            for k,v in pairs(Phones) do 
                SavePhone(v)
            end
    
            print("^5[Phone]^7 All Phones Saved!")
		end
	end)
end

startSave()
