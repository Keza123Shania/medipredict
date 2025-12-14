using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediPredict.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPregnantToPatient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPregnant",
                table: "Patients",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPregnant",
                table: "Patients");
        }
    }
}
