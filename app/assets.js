'use strict';
/* global define */

define([], () => ({
  indexTemplate: '\
<!DOCTYPE html>\n\
<html>\n\
  <head>\n\
    <meta charset="UTF-8">\n\
    <title>%%TITLE%%</title>\n\
    <meta name="apple-mobile-web-app-capable" content="yes">\n\
    <meta name="mobile-web-app-capable" content="yes">\n\
    <meta name="application-name" content="%%TITLE%%">\n\
    <link rel="shortcut icon" href="favicon.ico">\n\
    <link rel="icon" sizes="16x16" href="favicon.ico">\n\
    <link rel="icon" sizes="72x72" href="icon-72.png">\n\
    <link rel="icon" sizes="192x192" href="icon-192.png">\n\
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n\
    <script type="text/javascript" src="https://clic.xtec.cat/dist/jclic.js/jclic.min.js"></script>\n\
  </head>\n\
  <body style="margin:0">\n\
    <div class ="JClic" data-project="%%MAINFILE%%"></div>\n\
  </body>\n\
</html>',

  imsmanifestTemplate: '\
<?xml version="1.0" encoding="UTF-8"?>\n\
<!-- Generated by JClic - https://projectestac.github.io/jclic -->\n\
<manifest identifier="JClic-%%ID%%" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"\n\
 xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n\
 xsi:schemaLocation= "http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">\n\
 <metadata>\n\
  <schema>ADL SCORM</schema>\n\
  <schemaversion>1.2</schemaversion>\n\
 </metadata>\n\
 <organizations default="JClic">\n\
  <organization identifier="JClic">\n\
   <title>%%TITLE%%</title>\n\
   <item identifier="ITEM_JClic-%%ID%%" identifierref="RES_JClic-%%ID%%">\n\
    <title>%%TITLE%%</title>\n\
   </item>\n\
  </organization>\n\
 </organizations>\n\
 <resources>\n\
  <resource identifier="RES_JClic-%%ID%%" type="webcontent" href="/index.html" adlcp:scormtype="sco">\n\
%%FILES%%\n\
  </resource>\n\
 </resources>\n\
</manifest>',

  jsTemplate: 'if(JClicObject){JClicObject.projectFiles["%%JCLICFILE%%"]=%%XMLPROJECT%%;}',

  favicon: 'AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAwAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAA////AACZ/wAAzGYAcum8AEy//wCv8/kAAMz/ACXWhABN36AAzP//AIDZ/wCa8tkA\
Gqb/AGbM/wAzs/8Ad3d3d3d3d3d6qqqqqqqqp3qqpvIlaqqneqqyIiIrqqd6piIiIiKqp3quIiIi\
Iuqneq4iIiIi2qd6riL+8iImp3qmasyyIiuneqSDOGIiJad6qDMzbSIvp3qkMzNOVqqneqwzM5qq\
qqd6qjhGqqqqp3qqqqqqqqqnd3d3d3d3d3cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',

  icon72: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI\
WXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3woODCMYIQx9mwAADQxJREFUeNrtnHtwXNV9xz+/c/ct\
aSVb1tMPHvFDAmJqKB0MaVNsU5o+pk2pGfiHEsmQTh7TTkKxybSTnQDGEMZDO20zUEsmTTLTQidN\
QjsDaI0DJcW4PAK2LBtky2A9V2/tat/3/vrH7oIxYK8eK1sJ56+dvfeec+/n/l7ne84ufNrO2mSm\
F9z30Pp1ltrfFHA7ygsuY4W3b3+r91NAwJNPbrW6Txx5B7jkjENHQToQDacTqZ+HQt1Tv5aA7n+o\
+Vqj5mW3x2F1c5TIgI+xEQ/qfKibrMBBR6XDEg0nkzUHQqGfZ38tAD340GXfVpVQ46o4G28YBsC2\
DaNDHoYG/UT6vUyOeVH90GVZhFfE4Wkw4VTq0BuhEM6vJKAHdl3xgqC/s+HaMS5dF/3Yc9Ipw/CA\
j6EBP5F+H9Mx15mn9AuEHaTDbTR8zz2dg78SgHbturrSITkCuG76Yh/lweK8ZjrqIpIHNtzvI502\
Z55yQoWwcTSc8sq+0Dc6xxYloJ0PX/FHOPp0WXmW37+5b1aDqQqTYx4i/V6GBv2MDHpxPhy/0ooc\
MKJhHPOje+89dGLRAHpw1+WPKvzVJWtiXHXd6LwMns0axiIfxK+JUe/phxMGvWbHjiOd5xOQq+i3\
DzcC1DQk529wl0NtY5LaxiRcBfFpF5E+H28fCRKddPsdzJ8A5xWQKSq933/lcuAyEahrTJTsZgJl\
WS5eG0Ok8FL0vBegRQEy7uwWgMqlKTze0mboRNzF1IQbQF2SDS8KQMBNAHWNqZLfUGTAV/h4ePv2\
Y/0XPKBQCKOaiz91DYnSA+p/P1B3XAhp/pxB2h24fL04LLNcSnXdQliQP5delY5Q6Hddq04N3a+w\
GehGCasQ3tbW9e6Fk8VsuRFRltUmMUZLejNT4x6SCQsglUr5XlxxKtKqsD1/+DcRbhWgrbX5HYR9\
OBpWsfZvaytdcXlOQCK6Bcil4hK3oQ/iz/+GQq/F21qb/hSENfXT+N02AxNeRmMeHJU1KGsQ+UvB\
sdtaml4Hs0+FsGXHf/GlJ07O282etVDcvXujP5meGgN8W/54gMql6ZICeilcy1CfHxH91mdenXo0\
GqwYA3x/sD7CkrIMAA7C+LSLvjEf/eN+xqbd6Jk2D78Ewijh8qh58ZanOtMlsaBEZvI6QXxev11y\
OI4jjA7lArSN6YhVVm5EHZ/PY7MkkDktqyjVZRmqyzKsXxkllTUMTnoZnPAxOOkllrIshauBqxG2\
R4POaHtr8/MOss9lmfAdjx8+Po8uJvnsVXr3Go14yWYNCiPZxOHXHW1+UICGYPqsdu51OVxUneCi\
6lyGjSUtBqfywCa8pGxTrbBV0K22bdPW0hQRkRcQDTsqz54r4J8VkKjcCErNQqT3fPwRkf2hEE5b\
K5sA6itn9nLKfTarfXFW18ZRhbG4m8EJL4NTPoYnPdhIrcJWVLYKOG2tzW+i/FfSZx7+6j93xooG\
tHPnhhpI/8ZCFYhD/b7ClL/j+7c3VWfhKoCGytmPLcL77nj58hhZRxiZ8jA4lbOu0bjboGxA2OBL\
6WXAnxcNSE3qBkFMRWUGf6C0imk6bZgY9eRikct5Lusym0FN0J/F77XnL2Ubpb4qRX1VClbl3PHE\
cIBDvUFAN8+skpZ8/GksvXsND/hQFYDuv727613ypUVDZWljX7nPxu9xCjPjIzMCJJqLATULEKCH\
+v2FUfflP9wI5N50idvAZC5zqki4aED3PXzFZ4BLxSi19QsHSFQ72lrWrQMuNqLUBUsLyEEYygMS\
dZ4pGpDLdq4C8PttEnFXSW9yOuYiHrNy5Q/mec27dnVFGrdV2qnNWNRNOmsAJk+tqv+/ogGJcARw\
4tMunvtJI0//20oOvFBDz9vlH7dKMTfr6Su4F6/ee++hccm711yy10zdC9j/SWt3H/u0O3Yc6dy1\
67I/U8wORa9Jp4zVdzJA38kAAGUVWWobktQ1JKhpTOLxzF5EK9Q/qoQfu+tqN3b8hoUGpGeRVj7R\
HHbsOPJT4Ke7d2/0p1IT1zvGbBFlC7BhOuoyPdFyet4uR0SpXJqmtjFFXX2C6roUVpGuoSoM5+sf\
S3jGsmO/BabCYylLKzIlhZPJCqNTudLCsj8Z0Iw3L9x//5XLxZXdLMoWhM1A4+nHLcuhui5NXX2C\
2sYUVdWfbAljIx72/3cDQCydpHplr34L1W+vWJLg802lXR7rHffxwtFqgJ7Wtq5LZ68H5dvjdzat\
dTncysnMCTHZg3c8/vYPBPSBB5objJHPOUa2iPKHtm2WR/p9RPp98Dp4fTbL6lPUNSSoW54kUJb9\
qDgG+0OhzvSe1uZNAjQsKb17DRayF+yfm2BWsAyb21TkG6gG1bZob22ebFN9TU/IS6D7bMv/tYHG\
iq96PKPXiOVsUYfNCBtTSctzevyqWpqmrjFJTUOSoV5/vgbh+baWdRXAtbn51wLEn3FfPtWfXdot\
ysXatzXdpirfCfrs7prKVHP/uHd5Im2dCXcaeBHVsGM0vG3PsUOPfHd9IJu1fxsjW1R1M3Dlx4yp\
tnHWNRzTJkF+FvDYfPHq0i7XJ9IWP369HhRHnEx9y97u4blZkJrrQFfXVyZXX3PpREG/6Z1MuPp6\
Rvy8OxxYE89YS4EvIPIFo0J7S1NkaVdmn4qEVVKP3rmn++6dOzfUiGQ2OUa3iHIDEAQe+bt7ut5p\
29b0dXTms/dZZ69cHnnzbHCKBqTo9QA1p5m+MbpiSVlmxZKyDFddNEUiYxGZ8jA44aNvwksibdUC\
twl6m6ibttbmHrpTHSqE0x7rnq9879D4hweRmwAalyyce6Hy7Jw16Se3rvBH4bMAy8o+WVX0u+33\
hSsHYSzmZmDCS/+4j9FpD6pcguhdAnd509lUW0vTL1TkOePQkXGbEWxnLQJ1wdIqlygMRj35+KL7\
5gxooip4qeWoy20p5b7ipAeDsqw8zbLyNJ9dEf2oDjPt9iKySWCTGna5bCcOsDSQwee2S8pnPOEm\
mbZASIideGnOgFzKagXKvbPXhD5OhynIogMTPtK2BGajHs7FvUR5qZjVD9e5LdJZDUKFf/7e7Omy\
aNYRIlNe+se9rKwuPaBC/aNa3MrtuQGp1Arg95RGVXQZpbEqSWNV6eHYKgzn44+xTEdx4eJcui6U\
A7hLvKq6EG140kPWEVCN3PEvnW/OCyCgAsBlOYse0AfyhuwT0PkC5M7VPYueD0OT+QBtpOidI+d8\
bIVYQR5YzC2VtRiN5zZmqWM/O2+ATG6Oha2LG9DgpKfgVEdb24vfmHVuC1IdB3LF1SJuvfn6R+GZ\
mVx3bkDCOwBTCdeihWM7Qt+YvzCH/I95BWQccxwgmly8FhSZ8pCxc+m9fOLoK/NsQfYRIJvKWkyn\
FieknpFA4XF/cstT2PMKqLX9WBTVN3Jp0rvo4CQzFu+O5tzLMbp3ptcXWd2YFwEGpxYfoBPDgcLv\
Qd66c0/XgZIAEnWezmUCP7a9eNK97QjHBsoKc6bHZ9NHUYDeu+jo/wi8l8kKp8Z9iwZQ91AZ8Vx5\
MuROuZ8oGaBQCEdFfwhwbKB8UcDJOkJnX3kh0zxw+w/emi4ZIICskX8EkiMxDwMTF34seutUkETG\
AuipiMpjs+2naEBffrxrQGEvwJu9QS5k8WM87uZYfz72qPnruWwDntEcXSWzE4iNRj10D5VdmIHZ\
Fl7uXoKDgPCfre2dP5tLfzMCdOee7l5EQwC/fC9ILHXhTT9e6alifNoNMOxK21+fa38zVnlOraj/\
e+DldNbw4rGlF1Ta7+ovp2c4AJAVMbf+xb++3TfXPmf1dO1fumKlGvsNoHpldYLPrR3HnOeodHyo\
jAM9VTlJQ7mntb3ru/PR76x0wpa9h0+JciuQOjXq55XuqjP/TGBh4UTKeOVEDo7C91raux6Zr75n\
LaS2tHeFFd0KpE8MB3j+6DJS9sLqsgq8drKSA8er8vYrT/Su7PpasXpzyVzs9NbW0nQzIj8EfJWB\
DNevGWNJoPR/1ZHKGg4er+K9sfe3EO8+tfLI38z3317MS4Rta2naiMiPgXpLlPWroqxriGGJlsRs\
3h318+rJSpK5QjArIt9s2XPkH0rxIuYtBT12V3ODy+YJ4PcAyrw261dGubg6Pm+/VByOenn9ZJCR\
mOf9xKWYO7a1dR4slaXKPL9caW9p2obId4B6AL/HZm39NKuWJgj6Z+56iVROzzkeCTCRcBfuOqHK\
7uBU9IFbnuot6W8lSlLEtLWsq1Cx7hb0y0Bd4fugP0tNMMWysjSVfpuAL4vrtB2xdlaIZyyiCReT\
CTdDUx5Go57TI24c+JE41n0tew+fWohEUNIq78mtl3tilfbNqtwOspn8IuQMm4Pqaxj+PeV2t39k\
49ViBnR6+/7tTdVpD583jrlGRK9VYQ1KDeA549QYcBQ4qOhBFdczd+45PHS+aqzzPk/4p69cXi5q\
3ADLRsaTpY4pn7Z5bv8PFM+u32cIXhAAAAAASUVORK5CYII=',

  icon192: 'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz\
AAAphgAAKYYBIuzfjAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAASdEVY\
dFRpdGxlAEpDbGljIFBsYXllcidTCx4AAAAYdEVYdEF1dGhvcgBGcmFuY2VzYyBCdXNxdWV0c6I4\
QKgAAAAbdEVYdFNvdXJjZQBodHRwOi8vY2xpYy54dGVjLmNhdDk0bhcAAABEdEVYdENvcHlyaWdo\
dABDQyBBdHRyaWJ1dGlvbiBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8z\
LjAv9Mfv5AAAIABJREFUeJztnXmQI9d93z8ABsfc9+zOcIfUilxx2RrSZGiS4iHJJCUrtkLJsmwp\
Ksd2hIKtxHGUUlIpFByX40oqHo1cdiqOqnwIRmTFseNYYXS7JN7La3lfWCy5u+TegxnMBcwMZnAj\
f3RjMAN0YzBAd+N6n6qu5Tw0uh9n+tvv93vv934/Sz6fRyDoVKyN7oBA0EiEAAQdTVejO7Cb2bmZ\
DwJjwAgwCISAV3zeYLahHRO0LZZm8AFm52aswH8FvqzycRR4HHgUeMTnDZ4zs2+C9qbhApidm3EC\
3wI+V+VXLqCIAXjc5w0uG9Q1QQfQDAL4JvDrNX49D7xGURDP+LzBhE5dE3QADRXA7NzMKDAPOHS6\
ZAJ4hqIgXvN5g4238QRNS6MF8E+BvzXwFivAY8hieNTnDV4w8F6CFqTRAvhLwF3a/uGPL5JM2oiE\
XSzOu9iO6zZZdY7i6PCEzxtc0+vCgtak0QK4BEzvbnO6svyTz1/Zc95GzE4k7CIy72Jp0UU6pcvy\
RQ54maIgnvN5gyk9LixoHRomgNm5mRuBt0vbp4/GufMj2hM7+TysLjuJzLuIhLtZXXKQy1n06NIW\
cALFXALeEv5D+9NIAfwr4Oul7bffu8L7btis+jqZjIXlBReLYReR+W7Wo3a9urjIXv/hyj7nC1qQ\
RgrgO8CnS9t//pev0N1T+8JvYttGZN7FYribyLyLxLatnm7u5m2Ko8OTPm9wXa8LCxpHQwQwOzfT\
hTxDM7C7vX8wzc/+wryu91qP2hVnupvlBReZjC7mUgZ4kaIgTvq8wYweFxaYS6MEcA/wbGn79Tdt\
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\
ttN2dLAAAAAASUVORK5CYII='
}));
