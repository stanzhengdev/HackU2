<?php
/**
 * Defines the TOL_Nebulous_Exception class.
 *
 * PHP Version 5
 *
 * @package TOL_Nebulous
 * @author  Robert Bittle <robert.bittle@dominionenterprises.com>
 */

/**
 * Exception to throw when Nebulous does not return successfully.
 *
 * Defaults to a 500 error.
 *
 * @package TOL_Nebulous
 * @author  Robert Bittle <robert.bittle@dominionenterprises.com>
 */
class TOL_Nebulous_Exception extends Exception
{
    /**
     * The http status code of the exception
     *
     * @var int
     */
    public $iHttpStatusCode = 500;

    /**
     * Constructs
     *
     * @param string|null $sMessage        @see Exception::__construct()
     * @param int         $iHttpStatusCode a valid http status code
     * @param int         $iCode           @see Exception::__construct()
     * @param Exception   $oPrevious       @see Exception::__construct()
     */
    public function __construct(
        $sMessage = null,
        $iHttpStatusCode = 500,
        $iCode = 0,
        Exception $oPrevious = null
    ) {
        parent::__construct($sMessage, $iCode, $oPrevious);

        $this->iHttpStatusCode = $iHttpStatusCode;
    }
}
