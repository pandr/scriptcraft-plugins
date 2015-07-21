// Todo:
// OSD display "Survive x more seconds"
// Beam out on failure
// Beam out on success
//

var utils = require('utils');

// Persistent storage
var store = persist('monsterArena', { spawnpos: ""});

// Configuration. Enemies to spawn
var enemies = [
      org.bukkit.entity.EntityType.SPIDER,
      org.bukkit.entity.EntityType.SKELETON,
      org.bukkit.entity.EntityType.CREEPER,
      org.bukkit.entity.EntityType.ZOMBIE,
];

// Global vars

var timer_id = 0;
var seq = 0;
var lifeTime = 0;
var spawnedMobs = [];
var engagedPlayers = [];
var spawnDelay = 10;

function spawnPos()
{
  return utils.locationFromJSON(store.spawnpos);
}

// Helper functions

function spawn() {
  if (seq > lifeTime) {
    _ma_stop();
  }
  if ((seq % spawnDelay) === 0) {
    // spawn something
    var sp = spawnPos();
    if(sp !== null)
    {
      sp.world.strikeLightningEffect(sp);
      var mob_type = enemies[Math.floor(Math.random()*enemies.length)];
      var mob = sp.world.spawnEntity(sp, mob_type);
      spawnedMobs.push(mob);
    }
  }
  if(seq % 30)
  {
    spawnDelay = Math.floor(spawnDelay/2)+1;
    console.log("Spawn delay now: " + spawnDelay);
  }
  seq++;
}

function killAllMobs()
{
  console.log("Killing all mobs");
  for(var i = 0; i < spawnedMobs.length; i++)
  {
    var m = spawnedMobs[i];
    if(!m.isValid())
      continue;
    m.remove();
  }
  spawnedMobs = [];
}


// Internal command functions

function _ma_join(player, ttl) {
  if (timer_id !== 0) {
    console.log("Starting spawner. Player: " + player);
    // Already running
    //clearInterval(timer_id);
    lifeTime += ttl;
  }
  else {
    console.log("Joining. Player: " + player);
    timer_id = setInterval(spawn, 1000);
    seq = 0;
    killAllMobs();
    lifeTime = ttl;
  }
  engagedPlayers.push(player);
}

function _ma_stop() {
  if (timer_id !== 0) {
    console.log("Stopping spawner");
    clearInterval(timer_id);
    timer_id = 0;
    killAllMobs();
    engagedPlayers = [];
  }
}


// Event handling

function onPlayerDeath(event)
{
  console.log("PlayerDeath " + event.getEntity());
  for(var i = engagedPlayers.length-1; i >= 0; i--)
  {
    var p = engagedPlayers[i];
    console.log("Checking if " + p + " is " + event.getEntity());
    console.log("Checking if " + p.getUniqueId() + " is " + event.getEntity().getUniqueId());
    console.log("Checking if " + p.isValid());
    if(p.getUniqueId() == event.getEntity().getUniqueId())
    {
        console.log("Removing");
        engagedPlayers.splice(i,1);
    }
  }
  if(engagedPlayers.length == 0)
  {
    console.log("Everyone is dead");
    _ma_stop();
  }
}

events.playerDeath(onPlayerDeath);


// Command functions

function ma_join(args, sender) {
  var ttl = 120;
  if(args.length < 1)
  {
    sender.sendMessage("Usage: ma_join <player> <seconds>");
    return;
  }
  var player = utils.player(args[0]);
  if(player == null)
  {
    sender.sendMessage("Usage: ma_join <player> <seconds>");
    return;
  }
  var t = parseInt(args[1]);
  if(t > 0)
  {
    ttl = t;
  }
  _ma_join(player, ttl);
  sender.sendMessage(player.name + " joined monsterArena");
}

function ma_stop(args, sender) {
  _ma_stop();
  sender.sendMessage("monsterArena: stopped")
}

function ma_spawn(args, sender) {
  store.spawnpos = utils.locationToJSON(sender.getLocation());
  sender.sendMessage("monsterArena: spawn point set");
}

function ma_info(args, sender) {
  sender.sendMessage("monsterArena: spawn point: " + spawnPos());
  if (timer_id === 0) {
    sender.sendMessage("monsterArena: not running");
  } else {
    sender.sendMessage("monsterArena: running for " + seq + "/" + lifeTime + " secs");
    sender.sendMessage("monsterArena: spawn delay " + spawnDelay);
    sender.sendMessage("monsterArena: spawned mobs so far: " + spawnedMobs.length);
  }
}

command(ma_spawn);
command(ma_join);
command(ma_stop);
command(ma_info);