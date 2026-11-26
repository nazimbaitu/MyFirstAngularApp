using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ShopKhata.Application.Abstractions;
using ShopKhata.Domain.Entities;

namespace ShopKhata.WebApi.Authentication;

public sealed class JwtTokenService(IConfiguration configuration) : ITokenService
{
    public string CreateToken(UserAccount user)
    {
        var key = configuration["Jwt:SigningKey"];
        if (string.IsNullOrWhiteSpace(key) || Encoding.UTF8.GetByteCount(key) < 32)
            throw new InvalidOperationException("Configure Jwt:SigningKey with at least 32 bytes.");
        var issuer = configuration["Jwt:Issuer"] ?? "ShopKhata";
        var audience = configuration["Jwt:Audience"] ?? "ShopKhata.Client";
        var expires = DateTime.UtcNow.AddMinutes(int.TryParse(configuration["Jwt:LifetimeMinutes"], out var minutes) ? Math.Clamp(minutes, 5, 1440) : 60);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("shop_id", user.ShopId.ToString())
        };
        var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(issuer, audience, claims,
            expires: expires, signingCredentials: credentials));
    }
}
