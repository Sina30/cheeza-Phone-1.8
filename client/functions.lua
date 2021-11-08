calling = nil

function OpenPhone()
    if Config.RequireItem then 
        local item = Phone.TriggerServerEvent('phone:gotItem')

        if not item then return end    
    end

    if not PhoneData.Ready then
        return
    end

    PhoneData.Locked = true
    PhoneData.Open = true

    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)

    SetTime()

    SendNUIMessage({
        app = 'phone',
        method = 'open',
        data = {background = GetResourceKvpString('background')}
    })

    PhoneAnimation(true)
    Wait(250)
    PhoneData.Locked = false
end

function ClosePhone()
    DestroyMobilePhone()
    CellCamActivate(false, false)

    PhoneData.Locked = true
    SetNuiFocus(false, false)
    SendNUIMessage({app = 'phone', method = 'open', data = false})
    PhoneAnimation(false)

    PhoneData.Open = false
    Wait(250)
    PhoneData.Locked = false
end

function PhoneAnimation(pullingOut)
    if pullingOut then 
        LoadAnimDict('cellphone@', function ()
            if calling then 
                TaskPlayAnim(PlayerPedId(), 'cellphone@', 'cellphone_call_listen_base', 3.0, -1, -1, 50, 0, false, false, false)
            else 
                TaskPlayAnim(PlayerPedId(), 'cellphone@', 'cellphone_text_in', 3.0, -1, -1, 50, 0, false, false, false)
            end
            
            Wait(400)
            AddPhone()
        end)
    else 
        StopAnimTask(PlayerPedId(), 'cellphone@', 'cellphone_text_in', 3.0)
        LoadAnimDict('cellphone@', function ()
            TaskPlayAnim(PlayerPedId(), 'cellphone@', 'cellphone_text_out', 3.0, 3.0, 750, 50, 0, false, false, false)
            Wait(400)
            RemovePhone()
        end)
    end
end

function SetTime()
    local mins = GetClockMinutes()
    local hours = GetClockHours()
    if mins < 10 then mins = "0"..mins end
    if hours < 10 then hours = "0"..hours end
    SendNUIMessage({app = 'phone', method = 'setTime', data = {hour = hours, min = mins}}) 
end

function AddPhone()
    RemovePhone()

    local ped = PlayerPedId()

	RequestModel(Config.PhoneModel)
	while not HasModelLoaded(Config.PhoneModel) do
		Citizen.Wait(1)
	end

	PhoneData.Model = CreateObject(Config.PhoneModel, 1.0, 1.0, 1.0, 1, 1, 0)

	local bone = GetPedBoneIndex(ped, 28422)
	local isUnarmed = GetCurrentPedWeapon(ped, "WEAPON_UNARMED")

	if not isUnarmed then
		AttachEntityToEntity(PhoneData.Model, ped, bone, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1, 1, 0, 0, 2, 1)
	else
		SetCurrentPedWeapon(ped, "WEAPON_UNARMED", true)
		AttachEntityToEntity(PhoneData.Model, ped, bone, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1, 1, 0, 0, 2, 1)
	end
end

function RemovePhone()
    local x,y,z = table.unpack(GetEntityCoords(PlayerPedId()))
    local closeObj = GetClosestObjectOfType(x, y, z, 1.0, GetHashKey(Config.PhoneModel), false)
    SetEntityAsMissionEntity(closeObj)
    DeleteObject(closeObj)

	if PhoneData.Model ~= nil then
        DeleteObject(PhoneData.Model)
		PhoneData.Model = nil	
    end
end

function LoadAnimDict(dict, cb)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do 
        Wait(1)
    end
    cb()
end

function Notify(app, title, msg, data)
    if IsPlayerDead(PlayerId()) then 
        return
    end

    if Config.RequireItem then 
        local item = Phone.TriggerServerEvent('phone:gotItem')

        if not item then return end    
    end

    if not PhoneData.Ready then 
        return
    end

    SetTime()
    SendNUIMessage({
        app = 'phone',
        method = 'notify',
        data = {app = app, title = title, msg = msg, data = data}
    })
end

RegisterNetEvent('phone:notify', function (app, title, msg, data)
    Notify(app, title, msg, data)
end)

RegisterNUICallback('attemptCall', function (data, cb)
    if not calling then 
        calling = data.number
        local bool = Phone.TriggerServerEvent('phone:attemptCall', data.number)
    
        if bool then 
            calling = nil
            return
        end

        StopAnimTask(PlayerPedId(), 'cellphone@', 'cellphone_text_in', 1.0)
        StopAnimTask(PlayerPedId(), 'cellphone@', 'cellphone_call_to_text', 1.0)
        LoadAnimDict('cellphone@', function ()
            TaskPlayAnim(PlayerPedId(), 'cellphone@', 'cellphone_text_to_call', 3.0, -1, -1, 50, 0, false, false, false)
        end)
    end
end)

RegisterNUICallback('answerCall', function (data, cb)
    if calling then 
        Phone.TriggerServerEvent('phone:declineCall', calling)
    end

    calling = data.number
    Phone.TriggerServerEvent('phone:answerCall', data.number)
end)

RegisterNUICallback('declineCall', function (data, cb)
    calling = nil
    Phone.TriggerServerEvent('phone:declineCall', data.number)
end)

RegisterNetEvent('phone:declineCall', function ()
    calling = nil

    if PhoneData.Open then 
        StopAnimTask(PlayerPedId(), 'cellphone@', 'cellphone_text_to_call', 1.0)
        LoadAnimDict('cellphone@', function ()
            TaskPlayAnim(PlayerPedId(), 'cellphone@', 'cellphone_call_to_text', 3.0, -1, -1, 50, 0, false, false, false)
        end) 
    end

    if not Config.VOIP:match('salt') then 
        exports[Config.VOIP]:removePlayerFromCall()
    end

    SendNUIMessage({
        app = 'phone',
        method = 'declineCall',
        data = {number = calling}
    })
end)

RegisterNetEvent('phone:answerCall', function (number)
    calling = number

    StopAnimTask(PlayerPedId(), 'cellphone@', 'cellphone_text_in', 1.0)
    StopAnimTask(PlayerPedId(), 'cellphone@', 'cellphone_call_to_text', 1.0)
    LoadAnimDict('cellphone@', function ()
        TaskPlayAnim(PlayerPedId(), 'cellphone@', 'cellphone_text_to_call', 3.0, -1, -1, 50, 0, false, false, false)
    end)

    if not Config.VOIP:match('salt') then 
        exports[Config.VOIP]:addPlayerToCall(number)
    end

    SendNUIMessage({
        app = 'phone',
        method = 'answerCall',
        data = nil
    })
end)