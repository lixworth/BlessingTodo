<?php /* COPYRIGHT@dhdj COPYLEFT@lixworth 2020/4/24 17:29*/?>
<?php
require_once("GKDTools.php");
Runtime::start();

if (isset($_REQUEST['action']) && $_REQUEST['pwd'] == 'dhdjnb') {
    $DB0 = new Redis();
    $DB1 = new Redis();
    $DB2 = new Redis();
    $DB3 = new Redis();
    $DB4 = new Redis();
    $DB0->connect('127.0.0.1');
    $DB1->connect('127.0.0.1');
    $DB2->connect('127.0.0.1');
    $DB3->connect('127.0.0.1');
    $DB4->connect('127.0.0.1');
    $DB0->select(0);
    $DB1->select(1);
    $DB2->select(2);
    $DB3->select(3);
    $DB4->select(4);
    for ($i = 1; $i < 3; $i++) {
        if (!$DB3->exists("DB" . $i)) $DB3->set("DB" . $i, 0);
    }
    switch ($_REQUEST['action']) {
        case 'newTodo':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            $TIME_END = 0;
            $MIDs = [];
            foreach ($_REQUEST['data']['missions'] as $m) {
                $DB2->set(($DB2ID = $DB3->get("DB2")), serialize([
                    "TID" => ($DB1ID = $DB3->get("DB1")),
                    "CONTENT" => $m['content'],
                    "TIME_END" => strtotime($m['end']." +".$m["time"]." minutes"),
                    "TIME_START" => strtotime($m['estarto']),
                    "SONs_COMPLETED" => []
                ]));
                $MIDs[] = (int)$DB2ID;
                if (strtotime($m['end']." +".$m["time"]." minutes") > $TIME_END) $TIME_END = strtotime($m['end']." +".$m["time"]." minutes");
                $DB3->set("DB2", ++$DB2ID);
            }
            $DB1->set($DB1ID, serialize(["TITLE" => $_REQUEST['data']['title'], "CONTENT" => $_REQUEST['data']['content'], "MOTHER" => $_REQUEST['data']['creator'], "SONs" => [], "FATHERs" => [], "TIME_CREATED" => time(), "COMPLETED" => false, "MIDs" => $MIDs, "TIME_END" => $TIME_END]));
            $DB3->set("DB1", ++$DB1ID);
            if (!$DB0->exists($_REQUEST['data']['creator'])) {
                $DB0->set($_REQUEST['data']['creator'], serialize(['AS_SON' => [], 'AS_FATHER' => [], 'AS_MOTHER' => [--$DB1ID]]));
            } else {
                $U = unserialize($DB0->get($_REQUEST['data']['creator']));
                $U["AS_MOTHER"][] = --$DB1ID;
                $DB0->set($_REQUEST['data']['creator'], serialize($U));
            }
            RetVal::positive(['tid' => $DB1ID, 't' => unserialize($DB1->get($DB1ID))]);
            break;
        case 'sonJoin':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
            }
            $T = unserialize($DB1->get($_REQUEST['data']['tid']));
            if (in_array($_REQUEST['data']['uid'], $T['SONs'])) {
                RetVal::negative(['error' => 'ERR_UID_REPEATED']);
            }
            $T['SONs'][] = (int)$_REQUEST['data']['uid'];
            $DB1->set($_REQUEST['data']['tid'], serialize($T));
            if (!$DB0->exists($_REQUEST['data']['uid'])) {
                $DB0->set($_REQUEST['data']['uid'], serialize(['AS_SON' => [$_REQUEST['data']['tid']], 'AS_FATHER' => [], 'AS_MOTHER' => []]));
            } else {
                $U = unserialize($DB0->get($_REQUEST['data']['uid']));
                $U["AS_SON"][] = (int)$_REQUEST['data']['tid'];
                $DB0->set($_REQUEST['data']['uid'], serialize($U));
            }
            RetVal::positive(['t' => unserialize($DB1->get($_REQUEST['data']['tid'])), 'u' => unserialize($DB0->get($_REQUEST['data']['uid']))]);
            break;
        case 'fatherJoin':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
           }
            /*  if (!$DB1->exists($_REQUEST['data']['suid'])) {
                 RetVal::negative(['error' => 'ERR_sUID_DECLINED']);
             }*/
            $T = unserialize($DB1->get($_REQUEST['data']['tid']));
           /* if (in_array($_REQUEST['data']['fuid'], $T['FATHERs'])) {
                RetVal::negative(['error' => 'ERR_fUID_REPEATED']);
            }*/
            $T['FATHERs'][] = [(int)$_REQUEST['data']['fuid']=>(int)$_REQUEST['data']['suid']];
            $DB1->set($_REQUEST['data']['tid'], serialize($T));
            if (!$DB0->exists($_REQUEST['data']['fuid'])) {
                $DB0->set($_REQUEST['data']['fuid'], serialize(['AS_FATHER' => [$_REQUEST['data']['tid']], 'AS_SON' => [], 'AS_MOTHER' => []]));
            } else {
                $U = unserialize($DB0->get($_REQUEST['data']['fuid']));
                $U["AS_FATHER"][] = (int)$_REQUEST['data']['tid'];
                $DB0->set($_REQUEST['data']['fuid'], serialize($U));
            }
            RetVal::positive(['t' => unserialize($DB1->get($_REQUEST['data']['tid'])), 'fu' => unserialize($DB0->get($_REQUEST['data']['fuid']))]);
            break;
        case 'getTodo':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
            }
            $T = unserialize($DB1->get($_REQUEST['data']['tid']));
            $T["TIME_CREATED"] = date("Y/m/d H:i", $T["TIME_CREATED"]);
            $T["TIME_END"] = date("Y/m/d H:i", $T["TIME_END"]);

            $missions = array();
            foreach ($T['MIDs'] as $MID) {
                $Ms[$MID] = unserialize($DB2->get($MID));
                $Ms[$MID]["TIME_START_timestamp"] = $T["Missions"][$MID]["TIME_START"];
                $Ms[$MID]["TIME_END_timestamp"] = $T["Missions"][$MID]["TIME_END"];
                if (date("y", $Ms[$MID]["TIME_START"]) == date("y", $Ms[$MID]["TIME_END"]) &&
                    date("y", $Ms[$MID]["TIME_START"]) == date("y", time())) { //为同一年并且都是本年内 不显示年份
                    if (date("m月d日", $Ms[$MID]["TIME_START"]) == date("m月d日", $Ms[$MID]["TIME_END"])) { //为同一天的话 第二个不重复月和日
                        $Ms[$MID]["TIME_START"] = date("m月d日 H:i", $Ms[$MID]["TIME_START"]);
                        $Ms[$MID]["TIME_END"] = date("H:i", $Ms[$MID]["TIME_END"]);
                    } else {
                        $Ms[$MID]["TIME_START"] = date("m月d日 H:i", $Ms[$MID]["TIME_START"]);
                        $Ms[$MID]["TIME_END"] = date("m月d日 H:i", $Ms[$MID]["TIME_END"]);
                    }
                } else {
                    $Ms[$MID]["TIME_START"] = date("y年m月d日 H:i", $Ms[$MID]["TIME_START"]);
                    $Ms[$MID]["TIME_END"] = date("y年m月d日 H:i", $Ms[$MID]["TIME_END"]);
                }
                if ($Ms[$MID]["TIME_START_timestamp"] < time() || $Ms[$MID]["TIME_START_timestamp"] == time()) { //已经开始的事项
                    $Ms[$MID]["if_start"] = true; //是否开始了
                } else { //尚未开始
                    $Ms[$MID]["if_start"] = false; //是否开始了

                }
                array_push($missions,$Ms[$MID]);
            }
            $T['Missions'] = $missions;
            RetVal::positive(['t' => $T]);
            break;
        case 'getTodos':
            $Ts = [];
            $keys = $DB1->keys('*');
            foreach ($keys as $key) {
                $Ts[] = unserialize($DB1->get($key));
            }
            RetVal::positive(['ts' => $Ts]);
            break;
        case 'getMissions':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
            }
            $T = unserialize($DB1->get($_REQUEST['data']['tid']));
            $Ms = [];
            foreach ($T['MIDs'] as $MID) {
                $Ms[$MID] = unserialize($DB2->get($MID));
            }
            RetVal::positive(['ms' => $Ms]);
            break;
        case 'getTodoInWhichExists':
            /**
             * 获取与用户相关的Todo中的任务包
             */
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB0->exists($_REQUEST['data']['uid'])) {
                RetVal::negative(['error' => 'ERR_UID_DECLINED']);
            }
            $U = unserialize($DB0->get($_REQUEST['data']['uid']));
            $result = array();
            $all = array();
            $todo = array();
            $waitTodo = array();
            foreach ($U as $type) {
                foreach ($type as $item) {
                    $T = unserialize($DB1->get($item));
                    $T["TID"] = $item;
                    if ($T["MOTHER"] == $_REQUEST['data']['uid']) {
                        $T["creator"] = true;
                    } else {
                        $T["creator"] = false;
                    }
                    if(isset($T["FATHERs"][$_REQUEST['data']['uid']])){
                        $T["is_father"] = true;
                    }else{
                        $T["is_father"] = false;
                    }
                    $T["TIME_CREATED_timestamp"] = $T["TIME_CREATED"];
                    $T["TIME_END_timestamp"] = $T["TIME_END"];
                    $T["TIME_CREATED"] = date("Y/m/d H:i", $T["TIME_CREATED"]);
                    $T["TIME_END"] = date("Y/m/d H:i", $T["TIME_END"]);
                    $T["Missions"] = [];
                    $Ms = [];
                    $all_miss = array();
                    $todo_miss = array();
                    $waitTodo_miss = array();
                    foreach ($T['MIDs'] as $MID) {
                        $T["Missions"][$MID] = unserialize($DB2->get($MID));
                        $T["Missions"][$MID]["MID"] = $MID;
                        $T["Missions"][$MID]["is_outtime"] = false;

                        $T["Missions"][$MID]["TIME_START_timestamp"] = $T["Missions"][$MID]["TIME_START"];
                        $T["Missions"][$MID]["TIME_END_timestamp"] = $T["Missions"][$MID]["TIME_END"];

                        $T["Missions"][$MID]["IS_COMPLETED"] = in_array($_REQUEST['data']['uid'], $T["Missions"][$MID]["SONs_COMPLETED"]); //是否完成
                        if (date("y", $T["Missions"][$MID]["TIME_START"]) == date("y", $T["Missions"][$MID]["TIME_END"]) &&
                            date("y", $T["Missions"][$MID]["TIME_START"]) == date("y", time())) { //为同一年并且都是本年内 不显示年份
                            if (date("m月d日", $T["Missions"][$MID]["TIME_START"]) == date("m月d日", $T["Missions"][$MID]["TIME_END"])) { //为同一天的话 第二个不重复月和日
                                $T["Missions"][$MID]["TIME_START"] = date("m月d日 H:i", $T["Missions"][$MID]["TIME_START"]);
                                $T["Missions"][$MID]["TIME_END"] = date("H:i", $T["Missions"][$MID]["TIME_END"]);
                            } else {
                                $T["Missions"][$MID]["TIME_START"] = date("m月d日 H:i", $T["Missions"][$MID]["TIME_START"]);
                                $T["Missions"][$MID]["TIME_END"] = date("m月d日 H:i", $T["Missions"][$MID]["TIME_END"]);
                            }
                        } else {
                            $T["Missions"][$MID]["TIME_START"] = date("y年m月d日 H:i", $T["Missions"][$MID]["TIME_START"]);
                            $T["Missions"][$MID]["TIME_END"] = date("y年m月d日 H:i", $T["Missions"][$MID]["TIME_END"]);
                        }
                        /* 我前端是在做不出来了 只能这样了 */
                        if ($T["Missions"][$MID]["TIME_START_timestamp"] < time() || $T["Missions"][$MID]["TIME_START_timestamp"] == time()) { //已经开始的事项
                            $T["Missions"][$MID]["if_start"] = true; //是否开始了
                            if ($T["Missions"][$MID]["TIME_END_timestamp"] < time()) { //过时间的
                                if ($T["Missions"][$MID]["IS_COMPLETED"]) { //已完成

                                } else {
                                    $T["Missions"][$MID]["is_outtime"] = true;
                                    array_push($todo_miss, $T["Missions"][$MID]);
                                }
                            } else {
                                if (in_array($T["Missions"][$MID], $todo_miss)) {

                                } else {
                                    array_push($todo_miss, $T["Missions"][$MID]);
                                }
                            }
                        } else { //尚未开始
                            $T["Missions"][$MID]["if_start"] = false; //是否开始了
                            if (in_array($T["Missions"][$MID], $waitTodo_miss)) {
                            } else {
                                array_push($waitTodo_miss, $T["Missions"][$MID]);
                            }
                        }
                        if (in_array($T["Missions"][$MID], $all_miss)) {

                        } else {
                            array_push($all_miss, $T["Missions"][$MID]);
                        }
                        /* BugDhdj WangJianYi Dev Group 1998. */
                    }
                    array_push($result, $T); //貌似t就没用了
                    $T["Missions"] = $all_miss;
                    array_push($all, $T);
                    $T["Missions"] = $todo_miss;
                    array_push($todo, $T);
                    $T["Missions"] = $waitTodo_miss;
                    array_push($waitTodo, $T);
                }

            }
            RetVal::positive(['t' => $result, 'all' => $all, 'todo' => $todo, 'waitTodo' => $waitTodo]);
            break;
        case 'sonComplete':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB2->exists($_REQUEST['data']['mid'])) {
                RetVal::negative(['error' => 'ERR_MID_DECLINED']);
            }
            $M = unserialize($DB2->get($_REQUEST['data']['mid']));
            if (in_array($_REQUEST['data']['uid'], $M['SONs_COMPLETED'])) {
                RetVal::negative(['error' => 'ERR_UID_REPEATED']);
            }
            $M['SONs_COMPLETED'][] = (int)$_REQUEST['data']['uid'];
            $DB2->set($_REQUEST['data']['mid'], serialize($M));
            RetVal::positive(['m' => unserialize($DB2->get($_REQUEST['data']['mid'])), 'u' => unserialize($DB0->get($_REQUEST['data']['uid']))]);
            break;
        case 'isSonCompleted':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB0->exists($_REQUEST['data']['uid'])) {
                RetVal::negative(['error' => 'ERR_UID_DECLINED']);
            }
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
            }
            $T = unserialize($DB1->get($_REQUEST['data']['tid']));
            foreach ($T['MIDs'] as $MID) {
                $M = unserialize($DB2->get($MID));
                if (!in_array($_REQUEST['data']['uid'], $M['SONs_COMPLETED'])) {
                    RetVal::positive(['completed' => false]);
                }
            }
            RetVal::positive(['completed' => true]);
            break;
        case 'getCompletedSons':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB2->exists($_REQUEST['data']['mid'])) {
                RetVal::negative(['error' => 'ERR_MID_DECLINED']);
            }
            $M = unserialize($DB2->get($_REQUEST['data']['mid']));
            RetVal::positive(['us' => $M['SONs_COMPLETED']]);
            break;
        case 'getNotifications':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            $Ms = [];
            $ret = ["m" => []];
            $keys = $DB2->keys('*');
            foreach ($keys as $key) {
                $M = unserialize($DB2->get($key));
                $T = unserialize($DB1->get($M['TID']));
                if (!$T['COMPLETED']) {
                    if (time() >= $T['TIME_END']) {
                        $lazySons = array_diff($T['SONs'], $M['SONs_COMPLETED']);
                        if (!empty($lazySons)) {
                            $ret['m'][$key] = ['tid' => $M['TID'], 'lazy_sons' => $lazySons, 'stupid_fathers' => $T['FATHERs'], 'end' => $M['TIME_END']];
                        }
                        $T['COMPLETED'] = true;
                        $DB1->set($M['TID'], serialize($T));
                    }
                }
            }
            RetVal::positive($ret);
            break;
        case 'setCode':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
            }
            $uid = null;
            if (!empty($_REQUEST['data']['uid'])) {
                if (!$DB0->exists($_REQUEST['data']['uid'])) {
                    RetVal::negative(['error' => 'ERR_UID_DECLINED']);
                }
                $uid = $_REQUEST['data']['uid'];
            }
            $cid = rand(1000, 999999);
            while ($DB4->exists($cid)) {
                $cid = rand(1000, 999999);
            }
            $DB4->set($cid, serialize(["TID" => $_REQUEST['data']['tid'], "UID" => $uid]));
            RetVal::positive(['cid' => $cid]);
            break;
        case 'getCode':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB4->exists($_REQUEST['data']['cid'])) {
                RetVal::negative(['error' => 'ERR_CID_DECLINED']);
            }
            RetVal::positive(['c' => unserialize($DB4->get($_REQUEST['data']['cid']))]);
            break;
        case 'setTodoTitle':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
            }
            $T = unserialize($DB1->get($_REQUEST['data']['tid']));
            $T['TITLE'] = $_REQUEST['data']['title'];
            $T['COMPLETED'] = false;
            $DB1->set($_REQUEST['data']['tid'], $T);
            RetVal::positive(['t' => $T]);
            break;
        case 'setTodoContent':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
            }
            $T = unserialize($DB1->get($_REQUEST['data']['tid']));
            $T['CONTENT'] = $_REQUEST['data']['content'];
            $T['COMPLETED'] = false;
            $DB1->set($_REQUEST['data']['tid'], $T);
            RetVal::positive(['t' => $T]);
            break;
        case 'addMission':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB1->exists($_REQUEST['data']['tid'])) {
                RetVal::negative(['error' => 'ERR_TID_DECLINED']);
            }
            $T = unserialize($DB1->get($_REQUEST['data']['tid']));
            $DB2->set(($DB2ID = $DB3->get("DB2")), serialize([
                "TID" => $_REQUEST['data']['tid'],
                "CONTENT" => $_REQUEST['data']['content'],
                "TIME_END" => strtotime($_REQUEST['data']['end']),
                "TIME_START" => strtotime($_REQUEST['data']['estarto']),
                "SONs_COMPLETED" => []
            ]));
            if (strtotime($_REQUEST['data']['end']) > $T['TIME_END']) $T['TIME_END'] = strtotime($_REQUEST['data']['end']);
            $T['MIDs'][] = $DB2ID;
            $DB3->set("DB2", ++$DB2ID);
            $T['COMPLETED'] = false;
            $DB1->set($_REQUEST['data']['tid'], $T);
            RetVal::positive(['t' => $T, 'mid' => --$DB2ID]);
            break;
        case 'delMission':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB2->exists($_REQUEST['data']['mid'])) {
                RetVal::negative(['error' => 'ERR_MID_DECLINED']);
            }
            $M = unserialize($DB2->get($_REQUEST['data']['mid']));
            $T = unserialize($DB1->get($M['tid']));
            $DB2->del($_REQUEST['data']['mid']);
            $T['MIDs'] = array_values(array_diff($T['MIDs'], [$_REQUEST['data']['mid']]));
            if ($M['TIME_END'] == $T['TIME_END']) {
                $NEW_TIME_END = 0;
                foreach ($T['MIDs'] as $MID) {
                    if ($DB2->get($MID)['TIME_END'] > $NEW_TIME_END) $NEW_TIME_END = $DB2->get($MID)['TIME_END'];
                }
                $T['TIME_END'] = $NEW_TIME_END;
            }
            $T['COMPLETED'] = false;
            $DB1->set($_REQUEST['data']['tid'], $T);
            RetVal::positive(['t' => $T]);
            break;
        case 'modMission':
            $_REQUEST['data'] = json_decode(base64_decode($_REQUEST['data']), true);
            if (!$DB2->exists($_REQUEST['data']['mid'])) {
                RetVal::negative(['error' => 'ERR_MID_DECLINED']);
            }
            $M = unserialize($DB2->get($_REQUEST['data']['mid']));
            $DB2->set($_REQUEST['data']['mid'], serialize([
                "TID" => $M['TID'],
                "CONTENT" => $_REQUEST['data']['content'],
                "TIME_END" => strtotime($_REQUEST['data']['end']),
                "TIME_START" => strtotime($_REQUEST['data']['estarto']),
                "SONs_COMPLETED" => []
            ]));
            $T = unserialize($DB1->get($M['TID']));
            if (strtotime($_REQUEST['data']['end']) > $T['TIME_END']) $T['TIME_END'] = strtotime($_REQUEST['data']['end']);
            $T['COMPLETED'] = false;
            $DB1->set($M['TID'], $T);
            RetVal::positive(['m' => unserialize($DB2->get($_REQUEST['data']['mid']))]);
            break;
        default:
            RetVal::negative(['error' => 'ERR_ACT_DECLINED']);
            break;
    }
} else {
    RetVal::negative(['error' => 'ERR_REQ_DECLINED']);
}
/*
 * 暂定数据库结构
 * DB0 UID INDEX: UID=>["AS_SON"=>[Array of TIDs in which UID is a son],"AS_FATHER"=>[Array of TIDs in which UID is a father],"AS_MOTHER"=>[Array of TIDs in which UID is a mother]]
 * DB1 TID INDEX: TID=>["TITLE"=>The title of the table,"CONTENT"=>textual content of the table,
 * "MIDs"=>[Array of MIDs that are included in this table],
 * "SONs"=>[Array of SONs that are included in this table],
 * "FATHERs"=>[Array of FATHERs that are included in this table],
 * "MOTHER"=>The creator of the table,
 * "TIME_CREATED"=>Time of creation,
 * "TIME_END"=>Time of termination,
 * "COMPLETED"=>locked or not]
 * DB2 MID INDEX: MID=>["TID"=>TID in which the mission was assignment,"CONTENT"=>textual content of the mission,"TIME_END"=>Time of termination,"TIME_START"=>the start of the mission,"SONs_COMPLETED"=>[Array of SONs that have completed this mission]]
 * DB3 DB0-2 INDEX: DBID=>DB's current num
 * DB4 CID to TID & UID TABLE: CID=>["TID"=>,"UID"=>]
 */
/*
 * 暂定API结构
 * @?pwd=dhdjnb&action=newTodo&data= (data is in base64 form) data=>[“title”=>,"content"=>,"missions"=>[["content"=>,"estarto"=>,"end"=>],......],"creator"=>]
 * @?pwd=dhdjnb&action=getTodo&data= (data is in base64 form) data=>["tid"=>]
 * @?pwd=dhdjnb&action=getTodoInWhichExists&data= (data is in base64 form) data=>["uid"=>]
 * @?pwd=dhdjnb&action=getMissions&data= (data is in base64 form) data=>["tid"=>]
 * @?pwd=dhdjnb&action=getCompletedSons&data= (data is in base64 form) data=>["mid"=>]
 * @?pwd=dhdjnb&action=isSonCompleted&data= (data is in base64 form) data=>["tid"=>,"uid"=>]
 * @?pwd=dhdjnb&action=sonJoin&data= (data is in base64 form) data=>["uid"=>,"tid"=>]
 * @?pwd=dhdjnb&action=fatherJoin&data= (data is in base64 form) data=>["uid"=>,"tid"=>]
 * @?pwd=dhdjnb&action=sonComplete&data= (data is in base64 form) data=>["uid"=>,"mid"=>]
 * @?pwd=dhdjnb&action=getNotifications
 * @?pwd=dhdjnb&action=getTodos
 * @?pwd=dhdjnb&action=setCode&data= (data is in base64 form) data=>["tid"=> (,"uid"=>)]
 * @?pwd=dhdjnb&action=getCode&data= (data is in base64 form) data=>["cid"=>]
 * @?pwd=dhdjnb@action=setTodoTitle&data= (data is in base64 form) data=>["tid"=>,"title"=>]
 * @?pwd=dhdjnb@action=setTodoContent&data= (data is in base64 form) data=>["tid"=>,"content"=>]
 * @?pwd=dhdjnb@action=addMission&data= (data is in base64 form) data=>["tid"=>,"content"=>,"estarto"=>,"end"=>]
 * @?pwd=dhdjnb@action=delMission&data= (data is in base64 form) data=>["mid"=>]
 * @?pwd=dhdjnb@action=modMission&data= (data is in base64 form) data=>["mid"=>,"content"=>,"estarto"=>,"end"=>]
 */