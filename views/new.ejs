<?php
error_reporting(0);
// handle redirects
if (isset($_POST['createFolder'])) {
    createFolder($_POST['id'], htmlentities($_POST['folderName']), "exampleGroup.svg");
} elseif (isset($_POST['importExperiment'])) {
    createExperiment($_POST['experimentName'], $_POST['experimentCode'], $_POST['id']);
} elseif (isset($_POST['newExperiment'])) {
    header("Location: editor.php?id=" . $_POST['id']);
}
?>
<!DOCTYPE html>
<!--
Copyright (c) 2021 Alexander Romberg
-->

<head>
    <title>AtomAni</title>

    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/new.css">

    <?php require('favicon.php') ?>
</head>

<body>
    <?php
    $title = "Neues Element";
    require('header.php');

    // handle file upload
    function handleUpload()
    {
        define('MB', 1048576);
        if (isset($_POST['createFolder']) && isset($_FILES['folderImage'])) {
            if ($_FILES['folderImage']['error'] === UPLOAD_ERR_OK) {
                // get fileinfo
                $fileTmpPath = $_FILES['folderImage']['tmp_name'];
                $fileName = $_FILES['folderImage']['name'];
                $fileSize = $_FILES['folderImage']['size'];
                $fileNamePieces = explode(".", $fileName);
                $fileExtension = strtolower(end($fileNamePieces));

                // hash filename
                $fileNameHash = md5($fileTmpPath . time()) . '.' . $fileExtension;

                // check for right properties
                if (in_array($fileExtension, array('jpg', 'png'))) {
                    if ($fileSize < 5 * MB) {
                        if (move_uploaded_file($fileTmpPath, '../res/img/' . $fileNameHash)) {
                            return ["success" => true, "message" => $fileNameHash];
                        } else {
                            return ["success" => false, "message" => 'Die Datei konnte nicht auf dem Server gespeichert werden. Wenden Sie sich an ihren Systemadministrator.'];
                        }
                    } else {
                        return ["success" => false, "message" => "Datei ist zu gross. (Max. 5MB)"];
                    }
                } else {
                    return ["success" => false, "message" => "Dateityp nicht erlaubt."];
                }
            } else {
                return ["success" => false, "message" => "Wärend dem Upload ist ein Fehler aufgetreten."];
            }
        }
        return ["success" => false, "message" => null];
    }

    function addToFolderstructure($content, $cardData, $pathinfo, $id)
    {
        $itemId = 0;
        if (isset($pathinfo[$id]) && $pathinfo[$id] != "") {
            $data = addToFolderstructure($content, $cardData[$pathinfo[$id]]['subexperiments'], $pathinfo, $id + 1);
            $cardData[$pathinfo[$id]]['subexperiments'] = $data['data'];
            $itemId = $data['itemId'];
        } else {
            $itemId = $id . "." . count($cardData);
            $cardData[] = $content;
        }
        return ["data" => $cardData, "itemId" => $itemId];
    }

    function createFolder($id, $name, $image)
    {
        $cardData = json_decode(file_get_contents("../res/experiments.json"), true);

        $content['name'] = $name;
        $content['imgName'] = $image;
        $content['subexperiments'] = json_decode("{}");

        $data = addToFolderstructure($content, $cardData, explode('.', $id), 0);
        $cardData = $data['data'];

        file_put_contents("../res/experiments.json", json_encode($cardData, JSON_PRETTY_PRINT));

        header("Location: selection.php" . ($id == "" ? "" : "?id=" . $id));
    }

    function createExperiment($name, $code, $id)
    {
        $cardData = json_decode(file_get_contents("../res/experiments.json"), true);
        $content['name'] = $name;
        $content['imgName'] = "devExperiment.png";

        $data = addToFolderstructure($content, $cardData, explode('.', $id), 0);
        $cardData = $data['data'];

        file_put_contents("../res/experiments.json", json_encode($cardData, JSON_PRETTY_PRINT));
        file_put_contents("../res/experiments/" . $data['itemId'] . ".json", json_encode(json_decode($code, true), JSON_PRETTY_PRINT));
        header("Location: selection.php" . ($id == "" ? "" : "?id=" . $id));
    }

    ?>
    <main>
        <?php if (isset($_POST['experiment'])) { ?>
            <form action="new.php" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="id" value="<?php echo (isset($_POST['id']) ? $_POST['id'] : ""); ?>">
                <button type="submit" name="import">Aus Datei importieren</button>
                <button type="submit" name="newExperiment">Neues Experiment erstellen</button>
            </form>
        <?php } else if (isset($_POST['folder'])) { ?>
            <form action="new.php" method="POST">
                <input type="hidden" name="id" value="<?php echo (isset($_POST['id']) ? $_POST['id'] : ""); ?>">
                <label for="folderName">Ordner Name</label>
                <input type="text" pattern="^(?!\s*$).+" name="folderName" id="folderName" autofocus required>
                <!-- <label for="folderImage">Ordner Bild (max. 5MB)</label>
                <input type="file" name="folderImage" id="folderImage" accept="image/png, image/jpeg" required> -->
                <button type="submit" name="createFolder">Ordner erstellen</button>
            </form>
        <?php } else if (isset($_POST['import'])) { ?>
            <form action="new.php" method="POST">
                <input type="hidden" name="id" value="<?php echo (isset($_POST['id']) ? $_POST['id'] : ""); ?>">
                <label for="experimentName">Experiment Name</label>
                <input type="text" pattern="^(?!\s*$).+" name="experimentName" id="experimentName" autofocus required>
                <label for="experimentCode">Experiment Code</label>
                <textarea type="text" pattern="^(?!\s*$).+" name="experimentCode" id="experimentCode" rows="20" required></textarea>
                <button type="submit" name="importExperiment">Experiment erstellen</button>
            </form>
        <?php } else { ?>
            <form action="new.php" method="POST">
                <input type="hidden" name="id" value="<?php echo (isset($_GET['id']) ? $_GET['id'] : ""); ?>">
                <button type="submit" name="experiment">Experiment erstellen</button>
                <button type="submit" name="folder">Ordner erstellen</button>
            </form>
        <?php } ?>
    </main>
    <?php require("footer.php") ?>
</body>