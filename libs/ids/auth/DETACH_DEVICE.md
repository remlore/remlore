+------------+              +-----------------+             +------------+
|   User     |    Login     |  Identity Server|  Check      |User Device |
|  (SPA)     |----------->  |   (NestJS)      |  Device ID  |  Database  |
+------------+              +-----------------+             +------------+
                                |   Exists?
                                |--------------> YES? Allow Login
                                |                    |
                                |                    V
                                |              LastLoginAt updated
                                |                    |
                                |                    V
                                |              Mark as Current Device
                                |                   
                                |--------------> NO? Send Verification
                                                        |
                                                        V
                                                User Confirms Device
                                                        |
                                                        V
                                               Mark `verified = true`
                                                        |
                                                        V
                                                   Allow Login
