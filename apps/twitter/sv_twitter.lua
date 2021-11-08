Tweets = {}

Phone.RegisterEvent('phone:getTweets', function (source)
    local phone = GetPlayerPhone(source)

    table.sort(Tweets, function(a,b) return tonumber(a.date) > tonumber(b.date) end)

    return {account = phone.getAccount('twitter'), tweets = Tweets}
end)

Phone.RegisterEvent('phone:createTwitterAccount', function (source, username, image)
    local phone = GetPlayerPhone(source)

    local inUse = false
    for k,v in pairs(Phones) do 
        if v.accounts then 
            local twitter = v.accounts['twitter']
            if twitter then 
                if twitter.username == username then 
                    inUse = true
                    return
                end
            end
        end
    end

    if inUse then 
        return false
    else 
        phone.addAccount('twitter', {username = username, image = image})
    end

    return phone.getAccount('twitter')
end)

Phone.RegisterEvent('phone:deleteTwitterAccount', function (source)
    local phone = GetPlayerPhone(source)
    phone.deleteAccount('twitter')

    return phone.getAccount('twitter')
end)

Phone.RegisterEvent('phone:sendTweet', function (source, tweet)
    local phone = GetPlayerPhone(source)
    local MentionTag = tweet:split("@")

    for k,v in pairs(Phones) do 
        if v.uid ~= phone.getUID() then 
            if v.accounts then 
                local twitter = v.accounts['twitter']
                if twitter then 
                    if twitter.notifications then 
                        TriggerClientEvent('phone:notify', k, 'twitter', phone.getAccount('twitter').username, tweet, {sound = 'tweet.mp3'})
                    else 
                        for i = 2, #MentionTag, 1 do
                            local Handle = MentionTag[i]:split(" ")[1]
                            if Handle ~= nil or Handle ~= "" then
                                if twitter.username == Handle then 
                                    TriggerClientEvent('phone:notify', k, 'twitter', phone.getAccount('twitter').username, tweet, {sound = 'tweet.mp3'})
                                end     
                            end
                        end
                    end
                end
            end
        end
    end

    table.insert(Tweets, {account = phone.getAccount('twitter'), tweet = tweet, likes = {}, date = os.time()})

    table.sort(Tweets, function(a,b) return tonumber(a.date) > tonumber(b.date) end)

    TriggerClientEvent('phone:updateTweets', -1, Tweets)
end)

Phone.RegisterEvent('phone:likeTweet', function (source, id)
    local phone = GetPlayerPhone(source)

    local tweet = Tweets[id+1]

    local found = false
    for k,v in pairs(tweet.likes) do 
        if v.username == phone.getAccount('twitter').username then 
            found = k
            break
        end
    end

    if found then 
        table.remove(Tweets[id+1].likes, found)
    else
        table.insert(Tweets[id+1].likes, {username = phone.getAccount('twitter').username})    
    end

    table.sort(Tweets, function(a,b) return tonumber(a.date) > tonumber(b.date) end)

    TriggerClientEvent('phone:updateTweets', -1, Tweets)
end)

Phone.RegisterEvent('phone:deleteTweet', function (source, id)
    local phone = GetPlayerPhone(source)
    table.remove(Tweets, id+1)
    table.sort(Tweets, function(a,b) return tonumber(a.date) > tonumber(b.date) end)
    TriggerClientEvent('phone:updateTweets', -1, Tweets)
end)

Phone.RegisterEvent('phone:toggleNotifications', function (source)
    local phone = GetPlayerPhone(source)
    local account = phone.getAccount('twitter')

    phone.addAccount('twitter', {username = account.username, image = account.image, notifications = not account.notifications})

    table.sort(Tweets, function(a,b) return tonumber(a.date) > tonumber(b.date) end)
    TriggerClientEvent('phone:updateAccount', source, phone.getAccount('twitter'))
end)

function string:split(delimiter)
    local result = { }
    local from  = 1
    local delim_from, delim_to = string.find( self, delimiter, from  )
    while delim_from do
      table.insert( result, string.sub( self, from , delim_from-1 ) )
      from  = delim_to + 1
      delim_from, delim_to = string.find( self, delimiter, from  )
    end
    table.insert( result, string.sub( self, from  ) )
    return result
end