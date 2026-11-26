using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopKhata.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PersistReceiptOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowAddress",
                table: "ShopSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowFooter",
                table: "ShopSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowMobile",
                table: "ShopSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowAddress",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "ShowFooter",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "ShowMobile",
                table: "ShopSettings");
        }
    }
}
