Phone.RegisterEvent('phone:getImages', function (source)
    local phone = GetPlayerPhone(source)
    return phone.getGallery()
end)

Phone.RegisterEvent('phone:addImage', function (source, image)
    local phone = GetPlayerPhone(source)
    phone.addImage(image)
end)