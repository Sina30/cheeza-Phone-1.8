PhoneData = {
    Locked = false,
    Model = nil,
    Open = false,
    Focused = false,
    Ready = false
}

if Config.MultiChar and Config.UsingESX then 
    RegisterNetEvent('esx:playerLoaded', function ()
        TriggerServerEvent('phone:loadPhone')
    end)

    RegisterNetEvent('esx:onPlayerLogout', function ()
        PhoneData.Ready = false
    end)
else 
    CreateThread(function ()
        while true do 
            Wait(1)
            if NetworkIsPlayerActive(PlayerId()) then 
                TriggerServerEvent('phone:loadPhone')
                break
            end
        end
    end)
end

RegisterCommand('openPhone', function ()
    DestroyMobilePhone()
    CellCamActivate(false, false)

    if not IsPauseMenuActive() or IsScreenFadedOut() then 
        if not PhoneData.Locked then 
            if not PhoneData.Open then
                if not IsPlayerDead(PlayerId()) then 
                    OpenPhone()
                end
            else 
                ClosePhone()
            end
        end
    end
end)

RegisterNUICallback('close', function (data, cb)
    ClosePhone()
    cb()
end)

RegisterNUICallback('focus', function (data, cb)
    SetNuiFocusKeepInput(not data.toggle)
    PhoneData.Focused = data.toggle
    cb()
end)

RegisterNUICallback('resetPhone', function (data, cb)
    DeleteResourceKvp('background')
    Phone.TriggerServerEvent('phone:reset')
end)

RegisterNetEvent('phone:loaded', function ()
    PhoneData.Ready = true
end)

CreateThread(function ()
    while true do
        Wait(1)
        if PhoneData.Open then 
            SetTime()
            Wait(2000)
        end
    end
end)

CreateThread(function ()
    while true do
        Wait(0)
        if PhoneData.Open then 
            DisableAllControlActions(0)
            DisableAllControlActions(2)

            if not PhoneData.Focused then                 
                EnableControlAction(0, 32, true)
                EnableControlAction(0, 34, true)
                EnableControlAction(0, 31, true)
                EnableControlAction(0, 30, true)
                EnableControlAction(0, 22, true)
                EnableControlAction(0, 21, true)

                -- car
                EnableControlAction(0, 71, true)
                EnableControlAction(0, 72, true)
                EnableControlAction(0, 59, true)

                -- push to talk
                EnableControlAction(0, 249, true)
            end
        end
    end
end)

RegisterCommand('test', function ()
    Notify('messages', 'Big Man', 'andy', {})
end)

RegisterKeyMapping('openPhone', 'Phone', 'keyboard', Config.DefaultPhoneKey)