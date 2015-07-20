var utils = require('utils');

var store = persist('monsterArena', { spawnpos: ""});

var enemies = [
      org.bukkit.entity.EntityType.SPIDER,
      org.bukkit.entity.EntityType.SKELETON,
      org.bukkit.entity.EntityType.CREEPER,
      org.bukkit.entity.EntityType.ZOMBIE,
];

function ma_spawn(args, sender) {
  store.spawnpos = utils.locationToJSON(sender.getLocation());
  sender.sendMessage("monsterArena: spawn point set");
}

function spawnPos()
{
  return utils.locationFromJSON(store.spawnpos);
}

var timer_id = 0;
var seq = 0;
var lifeTime = 0;
var spawnedMobs = [];

function spawn() {
  if (seq > lifeTime) {
    _ma_stop();
  }
  if ((seq % 10) === 0) {
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
  seq++;
}

function _ma_start(ttl) {
  if (timer_id !== 0)
    clearInterval(timer_id);
  timer_id = setInterval(spawn, 1000);
  seq = 0;
  killAllMobs();
  lifeTime = ttl;
}

function _ma_stop() {
  if (timer_id !== 0) {
    clearInterval(timer_id);
    timer_id = 0;
    killAllMobs();
  }
}

function killAllMobs()
{
  for(var i = 0; i < spawnedMobs.length; i++)
  {
    var m = spawnedMobs[i];
    if(!m.isValid())
      continue;
    m.remove();
  }
  spawnedMobs = [];
}

function ma_start(args, sender) {
  var ttl = 30;
  var t = parseInt(args[0]);
  if(t > 0)
  {
    ttl = t;
  }
  _ma_start(ttl);
  sender.sendMessage("monsterArena: started");
}

function ma_stop(args, sender) {
  _ma_stop();
  sender.sendMessage("monsterArena: stopped")
}

function ma_info(args, sender) {
  sender.sendMessage("monsterArena: spawn point: " + spawnPos());
  if (timer_id === 0) {
    sender.sendMessage("monsterArena: not running");
  } else {
    sender.sendMessage("monsterArena: running for " + seq + "/" + lifeTime + " secs");
    sender.sendMessage("monsterArena: spawned mobs so far: " + spawnedMobs.length);
  }
}

command(ma_spawn);
command(ma_start);
command(ma_stop);
command(ma_info);