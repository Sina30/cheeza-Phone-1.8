Phone.RegisterEvent('phone:getInfo', function (source)
    local phone = GetPlayerPhone(source)
    return {number = phone.number}
end)