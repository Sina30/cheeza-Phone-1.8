Phone = {}
Server = IsDuplicityVersion()

if Server then 
    Phone.RegisterEvent = function (name, fn)
        RegisterNetEvent(('phone-events:%s'):format(name), function (id, ...)
            local src = source
            TriggerClientEvent(('phone-events:%s:%s'):format(name, id), src, fn(src, ...))
        end)
    end
end

if not Server then 
    local id = GetPlayerServerId(PlayerId())

    Phone.TriggerServerEvent = function (name, ...)
        local p = promise.new()

		SetTimeout(5000, function()
			p:reject({err="Event not Found!"})
		end)

        local handler = RegisterNetEvent(('phone-events:%s:%s'):format(name, id), function (...)
            p:resolve({...})
        end)

        TriggerServerEvent(('phone-events:%s'):format(name), id, ...)

        local data = Citizen.Await(p)
        RemoveEventHandler(handler)
        return table.unpack(data)
    end
end
