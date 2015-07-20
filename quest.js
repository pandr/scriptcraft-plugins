//load(__folder + "../core/scriptcraft");
// Revived from the dead of history: https://dullahansoftware.wordpress.com/2013/02/11/scriptcrafting-a-quest-in-minecraft/

var store = persist('quest', {players: {}, npcs:{}});

function initialize_quest (player_name){
  store.players[player_name] = {
			current:-1,
			accepted:false,
			skeleton_counter:0,
			steps:[{
				step:1,
				text:"Hello, " + player_name + ". I have an unpleasant task if you desire some work."
			},
			{
				step:2,
				text:"You see a gang of skeletons have grown bold and are attacking travelers in the area. If you thinned their numbers, the area would again be safe."
			},
			{
				step:3,
				text:"Kill 10 skeletons and return to me for your reward. \nType /jsp accept to accept: SKELETON MENACE."
			},
			{
				step:4,
				text:"Thank you " + player_name + ". The roads are now much safer. Here is your reward."
			}]};
}

function skeleton_kill_counter(event){
		var target = event.getEntity();
		var killer = target.getKiller();
		// check if it is the player who did the killing and if a skeleton was the target
		if(killer != null && /*killer.getUniqueId() == getPlayerObject().getUniqueId() &&*/ target.getType() == org.bukkit.entity.EntityType.SKELETON &&
				store.players[killer.name] != null){
			store.players[killer.name].skeleton_counter = (store.players[killer.name].skeleton_counter + 1);
			if(store.players[killer.name].skeleton_counter < 10){
				killer.sendMessage("" + store.players[killer.name].skeleton_counter + "/10 skeletons killed.");
			}
			else{
				killer.sendMessage("Return to the priest to recieve your reward.");
			}
		}
	}

function accept_quest(sender){
		var player = sender;//getPlayerObject();
		if(store.players[player.name] != null){
			store.players[player.name].accepted = true;
			// add skeleton killing watch
			events.entityDeath(skeleton_kill_counter);
			player.sendMessage("\nYou accepted the quest: SKELETON MENACE.\n");
		}
	}

function proc_quest(event){
		// make sure we are interacting with the quest giver
		var target = event.getRightClicked();
		if(target.getProfession() == org.bukkit.entity.Villager.Profession.PRIEST)
			event.setCancelled(true);
		var player = event.getPlayer();
		if(store.npcs[target.getUniqueId()] != null){
			// get the player's current quest progress
			var quest_progress = store.players[player.name];
					
			if(quest_progress == null){
				initialize_quest(player.name);
			}
			if(store.players[player.name].current > 1){
				if(store.players[player.name].skeleton_counter >= 10){
					var world = player.getWorld();
					store.players[player.name].current = (store.players[player.name].current + 1) % 4;
					world.spawnEntity(player.getLocation().add(1,0,1), org.bukkit.entity.EntityType.EXPERIENCE_ORB).setExperience(20);
					world.spawnEntity(player.getLocation().add(2,0,1), org.bukkit.entity.EntityType.EXPERIENCE_ORB).setExperience(10);
					world.spawnEntity(player.getLocation().add(4,0,1), org.bukkit.entity.EntityType.EXPERIENCE_ORB).setExperience(5);
					store.players[player.name].skeleton_counter = 0;
					store.players[player.name].accepted = false;
					store.players[player.name].current = 3;
				}
			}
			else{
				store.players[player.name].current = (store.players[player.name].current + 1) % 4;
			}
			player.sendMessage(store.players[player.name].steps[store.players[player.name].current].text);
		}
		else
		{
			player.sendMessage("huh?");
		}
	}

function spawn(sender){
		var player = sender;//getPlayerObject();
		var world  = player.getWorld();
		
		// create a villager
		var quest_npc = world.spawnCreature(player.getLocation().add(1,0,0), org.bukkit.entity.EntityType.VILLAGER);
		quest_npc.setProfession(org.bukkit.entity.Villager.Profession.PRIEST);
		store.npcs[quest_npc.getUniqueId()] = quest_npc;
		
		// listen for interaction events	
		events.playerInteractEntity(proc_quest);
	}

command("spawn_npc",function(params, sender){ spawn(sender); });
command("accept",function(params, sender){ accept_quest(sender); });
