<?PHP

require dirname(__FILE__) . '/SourceQuery.class.php';

$cachedList = "cache.txt";
$remoteList = "http://www.mendasp.net/stuff/servers_json.txt";

$action = $_GET['a'];

switch ($action) {
	case 1: // RETURN MASTER SERVER LIST
		$masterList = New MasterList;
		echo($masterList->getMasterList());
		break;
		
	case 2: // RETURN GETINFO QUERY FOR A SERVER
		$ip = $_GET['ip'];
		$port = $_GET['p'];
		
		if (($ip != 0) && ($port != 0)) {
			$query = New ServerQuery;
			$response = ($query->getInfo($ip, $port));
			$parsedResponse = json_encode($response);
			echo($parsedResponse);
		}
	break;
	
	case 3: // RETURN GETPLAYERS QUERY FOR A SERVER
		$ip = $_GET['ip'];
		$port = $_GET['p'];
		
		if (($ip != 0) && ($port != 0)) {
			$query = New ServerQuery;
			$response = ($query->getPlayers($ip, $port));
			$parsedResponse = json_encode($response);
			echo($parsedResponse);
		}
	break;
}

class MasterList {

	public static function getMasterList() {
		if (file_exists("cache.txt")) {
                        if(self::checkCacheTime()) {
                            return(self::getCachedMasterList());
                        } else {
                            return(self::getRemoteMasterList());
                        }
		} else {
			return(self::getRemoteMasterList());
		}
	}
        
        
	private static function getCachedMasterList() {
		$file = fopen("cache.txt", "rb");
		$output = '';
		while (!feof($file)) {
			$output .= fread($file, 8192);
		}
		fclose($file);              
		return($output);
	}

	 private static function getRemoteMasterList() {
		$file = fopen("http://www.mendasp.net/stuff/servers_json.txt", "rb");
		$output = '[';
		while (!feof($file)) {
			$output .= fread($file, 8192);
		}
		fclose($file);
		$output .= ']';
		
		$cache = fopen("cache.txt", "w");
		fwrite($cache, $output);
		fclose($cache);
                
                self::updateCacheTime();
                
		return($output);
	}
        
        private static function checkCacheTime() {
            $currentTime = time();
            $file = "time.txt";
            
            if (file_exists($file)) {
                $handle = fopen("time.txt", "r+");
            } else {
                $handle = fopen("time.txt", "w");
                fwrite($handle, strval($currentTime));
                fclose($handle);
                return false;
            }
            
            $timeStamp = fread($handle, 10);
            $timeDiff = $currentTime - $timeStamp;
            fclose($handle);
            
            if ($timeDiff > 2160) {
                return false;
            } else {
                return true;
            }
        }
        
        private static function updateCacheTime() {
            $currentTime = time();
            $handle = fopen("time.txt", "w");
            fwrite($handle, strval($currentTime));
            fclose($handle);
        }
	

}

class ServerQuery {

	function getInfo($ip, $port) {
	
		define( 'SQ_TIMEOUT',     1 );
		define( 'SQ_ENGINE',      SourceQuery :: SOURCE );
		
		$Timer = MicroTime( True );
		$Query = new SourceQuery( );
		
		$Info    = Array( );
		
		try
		{
			$Query->Connect( $ip, $port, SQ_TIMEOUT);
			
			$Info    = $Query->GetInfo( );
			//$Info[ 'Ping' ] = $Query->Ping( );
		}
		catch( SourceQueryException $e )
		{
			$Error = $e->getMessage( );
		}
		
		$Query->Disconnect( );
		
		return $Info;
	
	}
	
	function getPlayers($ip, $port) {
	
		define( 'SQ_TIMEOUT',     1 );
		define( 'SQ_ENGINE',      SourceQuery :: SOURCE );
		
		$Timer = MicroTime( True );
		$Query = new SourceQuery( );
		
		$Info    = Array( );
		
		try
		{
			$Query->Connect( $ip, $port, SQ_TIMEOUT);
			
			$Players    = $Query->GetPlayers( );
			//$Info[ 'Ping' ] = $Query->Ping( );
		}
		catch( SourceQueryException $e )
		{
			$Error = $e->getMessage( );
		}
		
		$Query->Disconnect( );
		
		return $Players;
	
	}

}

?>