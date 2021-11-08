Phone.RegisterEvent('phone:getContacts', function (src)
    local phone = GetPlayerPhone(src)
    local contacts = phone.getContacts()
    return contacts
end)

Phone.RegisterEvent('phone:addContact', function (src, id, number, name)
    local phone = GetPlayerPhone(src)
    local contacts = phone.getContacts()

    if phone.number == number then 
        return contacts
    end

    phone.addContact(id, number, name)

    contacts = phone.getContacts()
    return contacts
end)

Phone.RegisterEvent('phone:editContact', function (src, id, name, number)
    local phone = GetPlayerPhone(src)
    phone.editContact(id, name, number)

    local contacts = phone.getContacts()
    return contacts
end)

Phone.RegisterEvent('phone:deleteContact', function (src, id)
    local phone = GetPlayerPhone(src)
    phone.deleteContact(id)

    local contacts = phone.getContacts()
    return contacts
end)