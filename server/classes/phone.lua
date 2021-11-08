function CreatePhone(source, uid, number, contacts, messages, accounts, gallery)
    local self = {}

    self.source = source
    self.uid = uid
    self.number = number
    self.contacts = json.decode(contacts) or {
        {id = 'police', number = 'police', name = 'Police', delete = false},
        {id = 'ems', number = 'ambulance', name = 'EMS', delete = false},
    }
    self.messages = json.decode(messages) or {}
    self.accounts = json.decode(accounts) or {}
    self.gallery = json.decode(gallery) or {}

    self.getUID = function ()
        return self.uid
    end

    self.getNumber = function ()
        return self.number
    end

    self.getMessages = function ()
        return self.messages
    end
 
    self.getContacts = function ()
        return self.contacts
    end

    self.addContact = function (id, number, name)
        table.insert(self.contacts, {id = id, number = number, name = name, delete = true})
    end

    self.editContact = function (id, name, number)
        local index
        for k,v in pairs(self.contacts) do 
            if v.id == id then 
                index = k
            end
        end

        local contact = self.contacts[index]
        
        self.messages[number] = self.messages[contact.number]

        if contact.number ~= number then 
            self.messages[contact.number] = nil
        end

        self.contacts[index].number = number
        self.contacts[index].name = name
    end

    self.deleteContact = function (id)
        local index
        for k,v in pairs(self.contacts) do 
            if v.id == id then 
                index = k
            end
        end
        table.remove(self.contacts, index)
    end

    self.setMessages = function (messages)
        self.messages = messages
    end

    self.getGallery = function ()
        return self.gallery
    end

    self.addImage = function (image)
        table.insert(self.gallery, 1, image)
    end

    self.removeImage = function (k)
        table.remove(self.gallery, k)
    end

    self.addMessage = function (number, msg, coords)
        if self.messages[number] then 
            table.insert(self.messages[number], {number = self.number, msg = msg, date = os.time(), coords = coords})
        else 
            self.messages[number] = {{number = self.number, msg = msg, date = os.time(), coords = coords}}
        end        
    end

    self.getAccounts = function ()
        return self.accounts
    end

    self.getAccount = function (account)
        return self.accounts[account]
    end

    self.addAccount = function (account, data)
        self.accounts[account] = data
    end

    self.deleteAccount = function (account)
        self.accounts[account] = nil
    end

    self.reset = function ()
        self.contacts = Config.DefaultContacts
        self.messages = {}
        self.accounts = {}
        self.gallery = {}
    end

    return self
end