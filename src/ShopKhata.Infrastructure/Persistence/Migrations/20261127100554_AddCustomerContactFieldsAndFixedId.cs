using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopKhata.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerContactFieldsAndFixedId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (SELECT Mobile FROM dbo.Customers GROUP BY Mobile HAVING COUNT(*) > 1)
                    THROW 51000, 'Cannot create a unique customer mobile index while duplicate mobile numbers exist.', 1;

                CREATE TABLE dbo.CustomerIdMigrations
                (
                    OriginalId uniqueidentifier NOT NULL CONSTRAINT PK_CustomerIdMigrations PRIMARY KEY,
                    NewId nvarchar(20) NOT NULL CONSTRAINT UQ_CustomerIdMigrations_NewId UNIQUE
                );

                WITH OrderedCustomers AS
                (
                    SELECT Id, ROW_NUMBER() OVER (ORDER BY Id) AS RowNumber
                    FROM dbo.Customers
                )
                INSERT dbo.CustomerIdMigrations (OriginalId, NewId)
                SELECT Id,
                    N'NK' + CASE
                        WHEN RowNumber < 1000000 THEN RIGHT('000000' + CONVERT(varchar(20), RowNumber), 6)
                        ELSE CONVERT(varchar(20), RowNumber)
                    END
                FROM OrderedCustomers;

                ALTER TABLE dbo.Transactions DROP CONSTRAINT FK_Transactions_Customers_CustomerId;
                ALTER TABLE dbo.Payments DROP CONSTRAINT FK_Payments_Customers_CustomerId;
                DROP INDEX IX_Transactions_CustomerId ON dbo.Transactions;
                DROP INDEX IX_Payments_CustomerId ON dbo.Payments;
                DROP INDEX IX_Customers_ShopId_Mobile ON dbo.Customers;

                ALTER TABLE dbo.Customers ADD NewId nvarchar(20) NULL;
                UPDATE c SET NewId = m.NewId
                FROM dbo.Customers c
                INNER JOIN dbo.CustomerIdMigrations m ON m.OriginalId = c.Id;

                ALTER TABLE dbo.Transactions ADD NewCustomerId nvarchar(20) NULL;
                UPDATE t SET NewCustomerId = m.NewId
                FROM dbo.Transactions t
                INNER JOIN dbo.CustomerIdMigrations m ON m.OriginalId = t.CustomerId;

                ALTER TABLE dbo.Payments ADD NewCustomerId nvarchar(20) NULL;
                UPDATE p SET NewCustomerId = m.NewId
                FROM dbo.Payments p
                INNER JOIN dbo.CustomerIdMigrations m ON m.OriginalId = p.CustomerId;

                ALTER TABLE dbo.Customers DROP CONSTRAINT PK_Customers;
                ALTER TABLE dbo.Transactions DROP COLUMN CustomerId;
                ALTER TABLE dbo.Payments DROP COLUMN CustomerId;
                ALTER TABLE dbo.Customers DROP COLUMN Id;

                EXEC sp_rename 'dbo.Customers.NewId', 'Id', 'COLUMN';
                EXEC sp_rename 'dbo.Transactions.NewCustomerId', 'CustomerId', 'COLUMN';
                EXEC sp_rename 'dbo.Payments.NewCustomerId', 'CustomerId', 'COLUMN';
                ALTER TABLE dbo.Customers ALTER COLUMN Id nvarchar(20) NOT NULL;
                ALTER TABLE dbo.Transactions ALTER COLUMN CustomerId nvarchar(20) NOT NULL;
                ALTER TABLE dbo.Payments ALTER COLUMN CustomerId nvarchar(20) NOT NULL;

                ALTER TABLE dbo.Customers ADD CONSTRAINT PK_Customers PRIMARY KEY (Id);
                ALTER TABLE dbo.Transactions ADD CONSTRAINT FK_Transactions_Customers_CustomerId
                    FOREIGN KEY (CustomerId) REFERENCES dbo.Customers (Id) ON DELETE NO ACTION;
                ALTER TABLE dbo.Payments ADD CONSTRAINT FK_Payments_Customers_CustomerId
                    FOREIGN KEY (CustomerId) REFERENCES dbo.Customers (Id) ON DELETE NO ACTION;

                ALTER TABLE dbo.Customers ADD AdditionalMobile nvarchar(20) NULL;
                ALTER TABLE dbo.Customers ADD PhotoUrl nvarchar(500) NULL;
                ALTER TABLE dbo.Customers ADD SecondaryMobile nvarchar(20) NULL;

                CREATE UNIQUE INDEX IX_Customers_Mobile ON dbo.Customers (Mobile);
                CREATE INDEX IX_Customers_ShopId ON dbo.Customers (ShopId);
                CREATE INDEX IX_Transactions_CustomerId ON dbo.Transactions (CustomerId);
                CREATE INDEX IX_Payments_CustomerId ON dbo.Payments (CustomerId);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE dbo.Transactions DROP CONSTRAINT FK_Transactions_Customers_CustomerId;
                ALTER TABLE dbo.Payments DROP CONSTRAINT FK_Payments_Customers_CustomerId;
                DROP INDEX IX_Transactions_CustomerId ON dbo.Transactions;
                DROP INDEX IX_Payments_CustomerId ON dbo.Payments;
                DROP INDEX IX_Customers_Mobile ON dbo.Customers;
                DROP INDEX IX_Customers_ShopId ON dbo.Customers;

                CREATE TABLE #CustomerIdMap
                (
                    NewId nvarchar(20) NOT NULL PRIMARY KEY,
                    OriginalId uniqueidentifier NOT NULL
                );
                INSERT INTO #CustomerIdMap (NewId, OriginalId)
                SELECT c.Id, COALESCE(m.OriginalId, NEWID())
                FROM dbo.Customers c
                LEFT JOIN dbo.CustomerIdMigrations m ON m.NewId = c.Id;

                ALTER TABLE dbo.Customers ADD OriginalId uniqueidentifier NULL;
                UPDATE c SET OriginalId = m.OriginalId
                FROM dbo.Customers c INNER JOIN #CustomerIdMap m ON m.NewId = c.Id;
                ALTER TABLE dbo.Transactions ADD OriginalCustomerId uniqueidentifier NULL;
                UPDATE t SET OriginalCustomerId = m.OriginalId
                FROM dbo.Transactions t INNER JOIN #CustomerIdMap m ON m.NewId = t.CustomerId;
                ALTER TABLE dbo.Payments ADD OriginalCustomerId uniqueidentifier NULL;
                UPDATE p SET OriginalCustomerId = m.OriginalId
                FROM dbo.Payments p INNER JOIN #CustomerIdMap m ON m.NewId = p.CustomerId;

                ALTER TABLE dbo.Customers DROP CONSTRAINT PK_Customers;
                ALTER TABLE dbo.Transactions DROP COLUMN CustomerId;
                ALTER TABLE dbo.Payments DROP COLUMN CustomerId;
                ALTER TABLE dbo.Customers DROP COLUMN Id;
                EXEC sp_rename 'dbo.Customers.OriginalId', 'Id', 'COLUMN';
                EXEC sp_rename 'dbo.Transactions.OriginalCustomerId', 'CustomerId', 'COLUMN';
                EXEC sp_rename 'dbo.Payments.OriginalCustomerId', 'CustomerId', 'COLUMN';
                ALTER TABLE dbo.Customers ALTER COLUMN Id uniqueidentifier NOT NULL;
                ALTER TABLE dbo.Transactions ALTER COLUMN CustomerId uniqueidentifier NOT NULL;
                ALTER TABLE dbo.Payments ALTER COLUMN CustomerId uniqueidentifier NOT NULL;

                ALTER TABLE dbo.Customers ADD CONSTRAINT PK_Customers PRIMARY KEY (Id);
                ALTER TABLE dbo.Transactions ADD CONSTRAINT FK_Transactions_Customers_CustomerId
                    FOREIGN KEY (CustomerId) REFERENCES dbo.Customers (Id) ON DELETE NO ACTION;
                ALTER TABLE dbo.Payments ADD CONSTRAINT FK_Payments_Customers_CustomerId
                    FOREIGN KEY (CustomerId) REFERENCES dbo.Customers (Id) ON DELETE NO ACTION;

                ALTER TABLE dbo.Customers DROP COLUMN AdditionalMobile;
                ALTER TABLE dbo.Customers DROP COLUMN PhotoUrl;
                ALTER TABLE dbo.Customers DROP COLUMN SecondaryMobile;
                CREATE INDEX IX_Customers_ShopId_Mobile ON dbo.Customers (ShopId, Mobile);
                CREATE INDEX IX_Transactions_CustomerId ON dbo.Transactions (CustomerId);
                CREATE INDEX IX_Payments_CustomerId ON dbo.Payments (CustomerId);
                DROP TABLE dbo.CustomerIdMigrations;
                DROP TABLE #CustomerIdMap;
                """);
        }
    }
}
