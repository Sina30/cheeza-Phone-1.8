Config = {}

Config.DefaultPhoneKey = 'f1' -- this only applies for new members, old members will need to change in their settings
Config.APIToken = '' -- required for camera and gallery app (https://api.imgbb.com/), this process may be changed in the future
Config.SaveInterval = 5 -- mins
Config.PhoneModel = "prop_npc_phone" -- Phone Model
Config.StartingDigits = "07904" -- Starting Digits of peoples numbers
Config.VOIP = "pma-voice" -- (pma-voice|mumble-voip|saltychat) - this should match the name of your voice resource

Config.UsingESX = false -- this is currently only for dispatch
Config.MultiChar = false -- designed to work for esx_multicharacter, others may work - requires Config.UsingESX to be set to `true`
Config.RequireItem = false -- checks if player has `phone` item - requires Config.UsingESX to be set to `true`