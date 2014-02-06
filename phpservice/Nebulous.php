<?php
/**
 * Defines the TOL_Nebulous class.
 *
 * PHP Version 5
 *
 * This is the PHP client class that can used to access the Nebulous API.
 * 
 * To use the wrapper class create an instance passing in the appropriate
 * user
 *
 * @package TOL
 * @author  Robert Bittle <robert.bittle@dominionenterprises.com>
 * @author  Chris Ryan <christopher.ryan@dominionenterprises.com>
 */

include 'NebulousException.php';

/**
 * Main client class.
 *
 * @package TOL
 * @author  Robert Bittle <robert.bittle@dominionenterprises.com>
 * @author  Chris Ryan <christopher.ryan@dominionenterprises.com>
 */
class TOL_Nebulous
{
    /**
     * Production API host name value.
     *
     * @var string
     */
    const PRODUCTIONHOST = 'apis.traderonline.com';

    /**
     * Development API host name value.
     *
     * @var string
     */
    const DEVELOPMENTHOST = 'api-dev.traderonline.com';

    /**
     * The version of the api to access
     *
     * @var string
     */
    private $_sVersion;

    /**
     * The protocal used to access the api
     *
     * @var string
     */
    private $_sProtocol;

    /**
     * The api hostname
     *
     * @var string
     */
    private $_sHost;

    /**
     * The api user name
     *
     * @var string
     */
    private $_sUserName;

    /**
     * The api user password
     *
     * @var string
     */
    private $_sPassword;

    /**
     * The last set of headers
     *
     * @var string
     */
    private $_sLastHeaders;

    /**
     * The last response code
     *
     * @var int
     */
    private $_iLastResponseCode;

    /**
     * The last response code
     *
     * @var string
     */
    private $_sLastResponse;

    /**
     * The current access token
     *
     * @var string
     */
    private $_sAuthToken;

    /**
     * The array of active instances
     *
     * @var array
     */
    private static $_arActiveInstances;

    /**
     * The action translation array
     *
     * @var array
     */
    static private $_arValidActions = array(
        'GET' => 'GET',
        'LIST' => 'GET',
        'POST' => 'POST',
        'PUT' => 'PUT',
        'UPDATE' => 'PUT'
    );

    /**
     * Construct a new API Interface with that will access the api using
     * the given username, password, host, and optionally version.
     *
     * @param string $sUserName The user name
     * @param string $sPassword The password
     * @param string $sVersion  The version
     *
     * @return void
     * username = 'HackU-TOL'
     * pass = '0%hqaUC^^zlx]XV4<M|Mm#T1sBxIbl_O'
     */
    public function __construct($sUserName = 'Cycle-Webservers', $sPassword = 'Cu6bAc_WiSgKAy^?f`', $sVersion = 'Latest')
    {
        $this->_sHost = self::PRODUCTIONHOST;

        $this->_sProtocol = 'https';
        $this->_sVersion = "v{$sVersion}";
        $this->_sUserName = $sUserName;
        $this->_sPassword = $sPassword;
    }

    /**
     * Get the default nebulous instance
     *
     * @param string $sAuthLevel The desired authentication level
     *
     * @return TOL_Nebulous
     */
    public static function getInstance($sAuthLevel = 'default')
    {
        if (!isset(self::$_arActiveInstances[$sAuthLevel])) {
            self::$_arActiveInstances[$sAuthLevel] = new TOL_Nebulous();
        }

        return self::$_arActiveInstances[$sAuthLevel];
    }

    /**
     * Send an oAuth request to the api for an access token.
     *
     * @throws TOL_Nebulous_LoginException If the login fails
     *
     * @return void
     */
    private function login()
    {
        $this->_sAuthToken = null;

        $arParams = array(
            'client_id' => $this->_sUserName,
            'client_secret' => $this->_sPassword,
            'grant_type' => 'client_credentials'
        );

        $arReturn = $this->_dispatch(
            'token',
            http_build_query($arParams),
            'POST',
            false
        );
        if (!empty($arReturn['error'])) {
            throw new TOL_Nebulous_Exception($arReturn['error']);
        }

        if (empty($arReturn['access_token'])) {
            throw new TOL_Nebulous_Exception(
                'Bad authentication token returned'
            );
        }

        $this->_sAuthToken = $arReturn['access_token'];
    }

    /**
     * Checks the headers from the last call for a Location and returns the ID
     * or first part after the url following the module.
     *
     * @return string
     */
    public function getLastId()
    {
        preg_match(
            "/Location: \/{$this->_sVersion}\/[^\/]*\/(.*)/",
            $this->_sLastHeaders, $sUrl
        );
        $sId = false;
        if (count($sUrl) < 2) {
            $sId = trim($sUrl[1]);
        }

        return $sId;
    }

    /**
     * Returns the HTTP response code of the last call to the api.
     *
     * @return int
     */
    public function getLastResponseCode()
    {
        return $this->_iLastResponseCode;
    }

    /**
     * Returns the actual data response of the last call to the api.
     *
     * @return string
     */
    public function getLastResponse()
    {
        return $this->_sLastResponse;
    }

    /**
     * Returns the HTTP headers of the last call to the api.
     *
     * @return string
     */
    public function getLastHeaders()
    {
        return $this->_sLastHeaders;
    }

    /**
     * A generic call method for accessing api functionality based on a
     * formatted function call pattern.
     *
     * Example: getAds('1',array('realmId'=>5));
     *    This get make a GET request to /version/ads/1?realmId=5
     *
     * @param string $sFuncName The called function
     * @param array  $arArgs    The arguments to the function
     *
     * @throws TOL_Nebulous_Exception If the request fails
     *
     * @return array|string A get/list action will return the array of returned data
     * A post/put action will return the id of the last edited resource
     */
    public function __call($sFuncName, $arArgs)
    {
        $arNameParts = preg_split(
            '/(?=[A-Z])/',
            $sFuncName,
            -1,
            PREG_SPLIT_NO_EMPTY
        );
        $sAction = strtoupper(array_shift($arNameParts));
        $sModule = implode('-', array_map('strtolower', $arNameParts));

        if (!array_key_exists($sAction, self::$_arValidActions)) {
            throw new TOL_Nebulous_Exception($sFuncName.' is not a valid method.');
        }

        $arParams = array();
        foreach ($arArgs as $i => $mArg) {
            if (is_object($mArg)) {
                $mArg = (array)$mArg;
            }

            if (is_array($mArg)) {
                $arParams = array_merge($arParams, $mArg);
            } elseif (!empty($mArg)) {
                $sModule .= '/'.$mArg;
            }
        }

        return $this->_dispatch(
            $sModule,
            $arParams,
            self::$_arValidActions[$sAction]
        );
    }

    /**
     * Dispatch the api request with curl
     *
     * @param string       $sUrl       The base url 
     * @param array|string $mParams    The parameters for the request.
     * An array or query string.
     * @param string       $sMethod    The HTTP method
     * @param string       $bAutoLogin Should we login automatically?
     * 
     * @throws TOL_Nebulous_Exception      If the api request fails
     * @throws TOL_Nebulous_LoginException If the authentication fails
     * 
     * @return array|string A get/list action will return the array of returned data
     * A post/put action will return the id of the last edited resource
     */
    private function _dispatch(
        $sUrl,
        $mParams,
        $sMethod,
        $bAutoLogin = true
    )
    {
        if ($bAutoLogin) {
            $this->_checkLogin();
        }

        $sFullUrl = $this->_buildVersionedURL(
            $sUrl,
            $sMethod == 'GET' ? $mParams : null
        );

        /**
         * @todo Verify CURLOPT_SSL_VERIFYPEER=false is a windows problem once live
         */
        $arOptions = array(
                CURLOPT_URL => $sFullUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HEADER => true,
                CURLOPT_VERBOSE => false,
                CURLOPT_FORBID_REUSE => true,
                // apis.traderonline.com appears to use traderonline.com certificate
                // when on a windows box and causes the curl to fail
                CURLOPT_SSL_VERIFYPEER => false,
        );

        switch($sMethod) {
            case 'DELETE':
                $arOptions[CURLOPT_CUSTOMREQUEST] = 'DELETE';
                break;
            case 'POST':
                $arOptions[CURLOPT_POST] = true;
                break;
            case 'PUT':
                $arOptions[CURLOPT_CUSTOMREQUEST] = 'PUT';
                break;
        }

        $arHttpHeaders = array();
        if (!empty($mParams) && $sMethod !== 'GET') {
            if (is_array($mParams)) {
                $arHttpHeaders[] = 'Content-Type: application/json';
                $arOptions[CURLOPT_POSTFIELDS] = json_encode($mParams);
            } else {
                $arOptions[CURLOPT_POSTFIELDS] = $mParams;
            }
        }

        if (!empty($this->_sAuthToken)) {
            $arHttpHeaders[] = 'Authorization: Bearer '.$this->_sAuthToken;
        }

        if (!empty($arHttpHeaders)) {
            $arOptions[CURLOPT_HTTPHEADER] = $arHttpHeaders;
        }

        $oCurlHandle = curl_init();

        curl_setopt_array($oCurlHandle, $arOptions);

        $sResponse = curl_exec($oCurlHandle);

        if ($sResponse === false) {
            throw new TOL_Nebulous_Exception(curl_error($oCurlHandle));
        }

        $arInfo = curl_getinfo($oCurlHandle);
        curl_close($oCurlHandle);

        $this->_iLastResponseCode = $arInfo['http_code'];

        $this->_sLastHeaders = substr($sResponse, 0, $arInfo['header_size']);
        $this->_sLastResponse = substr($sResponse, $arInfo['header_size']);

        $arErrorData = null;
        if ($this->_iLastResponseCode == 401) {
            if ($bAutoLogin) {
                $this->login();
                $this->_dispatch($sUrl, $mParams, $sMethod, false);
            } else {
                $arErrorData = json_decode($this->_sLastResponse, true);
                if ($arErrorData['error'] === 'invalid_scope') {
                    throw new TOL_Nebulous_Exception('Insufficient Privileges');
                } else {
                    throw new TOL_Nebulous_Exception();
                }
            }
        } elseif ($this->_iLastResponseCode >= 400) {
            $arErrorData = json_decode($this->_sLastResponse, true);
            throw new TOL_Nebulous_Exception(
                $arErrorData['error']['message'], $arInfo['http_code']
            );
        }

        if ($sMethod === 'GET' || !is_array($mParams)) {
            return json_decode($this->_sLastResponse, true);
        } else {
            return $this->getLastId();
        }
    }

    /**
     * Verify that we are authenicated
     *
     * @return void
     */
    private function _checkLogin()
    {
        if (empty($this->_sAuthToken)) {
            $this->login();
        }
    }

    /**
     * Build the url with the version and parameters
     *
     * @param string $sUrl     The base url
     * @param array  $arParams The array of parameters for a GET request
     *
     * @return string
     */
    private function _buildVersionedURL($sUrl, $arParams = null)
    {
        // if there is no leading / then we need to add the version
        if (strncmp($sUrl, '/', 1) != 0) {
            $sUrl = '/'.$this->_sVersion.'/'.$sUrl;
        }

        if (!empty($arParams)) {
            $sUrl .= (strstr($sUrl, '?') ? '&' : '?') . http_build_query($arParams);
        }

        return $this->_sProtocol . '://' . $this->_sHost . $sUrl;
    }
}
