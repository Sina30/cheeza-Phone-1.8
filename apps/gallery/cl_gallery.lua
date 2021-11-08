RegisterNUICallback('getImages', function (data, cb)
    local gallery = Phone.TriggerServerEvent('phone:getImages')
    cb(gallery)
end)

RegisterNUICallback('addImageToGallery', function (data, cb)
    Phone.TriggerServerEvent('phone:addImage', data.image)
end)