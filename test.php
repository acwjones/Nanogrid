<?PHP

$masterList = New MasterList;
echo($masterList->getRemoteMasterList());

class MasterList {
	function getRemoteMasterList() {
		$file = fopen("http://www.mendasp.net/stuff/servers_json.txt", "rb");
		$output = '';
		while (!feof($file)) {
			$output .= fread($file, 8192);
		}
		fclose($file);
		return($output);
	}
}

?>