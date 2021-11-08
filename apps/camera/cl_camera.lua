local currentCamMode = false

RegisterNUICallback('openCamera', function (data, cb)
    CreateMobilePhone(1)
    CellCamActivate(true, true) 
    CellFrontCamActivate(currentCamMode)
    cb('ok')
end)

RegisterNUICallback('switchCam', function (data, cb)
    currentCamMode = not currentCamMode
    CellFrontCamActivate(currentCamMode)
    cb('ok')
end)

RegisterNUICallback('takePic', function (data, cb)
    if Config.APIToken and #Config.APIToken > 0 then 
        exports['screenshot-basic']:requestScreenshotUpload(('https://api.imgbb.com/1/upload?key=%s'):format(Config.APIToken), 'image', function(img)
            if img then 
                local json = json.decode(img)

                if json and json.data then 
                    cb(json.data.url)
                end
            end
        end)
    else 
        print("^5[Phone]^7 Message to devs, please setup image API for phone (see more in config).")
    end
end)

RegisterNUICallback('closeCamera', function (data, cb)
    DestroyMobilePhone()
    CellCamActivate(false, false) 
    if PhoneData.Open and not PhoneData.Locked then 
        PhoneAnimation(true)
    end
    cb('ok')
end)

function CellFrontCamActivate(activate)
    local ret = Citizen.InvokeNative(0x2491A93618B7D838, activate)
	return ret
end
